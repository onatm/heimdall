/* eslint-disable babel/camelcase */
import querystring from 'querystring';

import {
  responseTypeToken, scopeProfile, scopeEmail, scopeGroups,
} from '../oauth2/consts';
import { newAccessToken, newIdToken } from '../oauth2';

class ProviderCallbackHandler {
  constructor({ issuer, expiry }, store, accountManager) {
    this.issuer = issuer;
    this.expiry = expiry;
    this.store = store;
    this.accountManager = accountManager;
  }

  handle = async (req, res) => {
    const {
      originalUrl,
      query: { error, error_description: errorDescription, state: authReqId },
      params: { provider: providerId },
    } = req;

    if (error) {
      res.status(500);
      return res.render('error', { error: `${error}: ${errorDescription}` });
    }

    if (!authReqId) {
      res.status(400);
      return res.render('error', { error: 'User session error.' });
    }

    const authReq = await this.store.getAuthReq(authReqId);

    if (!authReq) {
      res.status(500);
      return res.render('error', { error: "Invalid 'state' parameter provided: not found" });
    }

    if (providerId !== authReq.providerId) {
      res.status(500);
      return res.render('error', {
        error:
          `Provider mismatch: authentication started with id ${authReq.providerId},`
          + ` but callback for id ${providerId} was triggered`,
      });
    }

    const provider = this.store.getProvider(providerId);

    const providerIdentity = await provider.handleCallback(authReq.id, authReq.scopes, originalUrl);

    if (providerIdentity.error) {
      res.status(500);
      return res.render('error', { error: providerIdentity.error });
    }

    const account = await this.accountManager.findAccount(providerIdentity, providerId);

    req.sessionOptions.maxAge = authReq.maxAge || req.sessionOptions.maxAge;
    req.session.accountId = account.id;

    // check scopes to create claims https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
    let claims = {};

    if (authReq.scopes.includes(scopeProfile)) {
      claims = {
        name: account.name,
        preferred_username: account.username,
      };
    }

    if (authReq.scopes.includes(scopeEmail)) {
      claims = {
        ...claims,
        email: account.email,
        email_verified: true,
      };
    }

    const now = Math.floor(new Date().getTime() / 1000);

    if (authReq.maxAge) {
      claims = {
        ...claims,
        auth_time: now,
      };
    }

    if (authReq.scopes.includes(scopeGroups)) {
      claims = {
        ...claims,
        groups: providerIdentity.groups,
      };
    }

    claims = {
      ...claims,
      provider_claims: {
        id: providerId,
        user_id: providerIdentity.id,
      },
      updated_at: account.updated_at,
    };

    // no need for approval. heimdall authenticates users only using external providers
    // if approval flow ever gets implemented then authReq should be updated with identity
    // and loggedIn flag
    // also there could be some use of authReq.expiry

    // eslint-disable-next-line no-unused-vars
    const _ = await this.store.deleteAuthReq(authReq.id);

    const { keystore } = this.store;
    const key = keystore.get({ kty: 'RSA' });

    let accessToken;

    if (authReq.responseTypes.includes(responseTypeToken)) {
      const accessTokenExpiry = now + Math.round(this.expiry.accessToken);

      accessToken = newAccessToken(
        key,
        this.issuer,
        account.id,
        authReq.audience,
        authReq.clientId,
        authReq.scopes,
        accessTokenExpiry,
      );
    }

    const idTokenExpiry = now + Math.round(this.expiry.idToken);

    const idToken = newIdToken(
      key,
      this.issuer,
      account.id,
      authReq.clientId,
      authReq.nonce,
      claims,
      accessToken,
      idTokenExpiry,
    );

    let values = {
      id_token: idToken,
      state: authReq.state,
    };

    if (accessToken) {
      values = {
        token_type: 'bearer',
        access_token: accessToken,
        expires_in: this.expiry.accessToken,
        ...values,
      };
    }

    return res.redirect(`${authReq.redirectURI}#${querystring.stringify(values)}`);
  };
}

export default ProviderCallbackHandler;
