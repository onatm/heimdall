/* eslint-disable babel/camelcase */
import querystring from 'querystring';

import nanoid from 'nanoid';

import { responseTypeToken } from '../consts';
import Oauth2 from '../oauth2';

class ProviderCallbackHandler {
  constructor(config, store) {
    this.config = config;
    this.store = store;
  }

  handle = async (req, res) => {
    const { error, error_description: errorDescription, state: authReqId } = req.query;

    if (error) {
      res.status(500);
      return res.render('error', { error: `${error}: ${errorDescription}` });
    }

    if (!authReqId) {
      res.status(400);
      return res.render('error', { error: 'User session error.' });
    }

    const authReq = this.store.getAuthReq(authReqId);

    if (!authReq) {
      res.status(500);
      return res.render('error', { error: "Invalid 'state' parameter provided: not found" });
    }

    const providerId = req.params.provider;

    if (providerId !== authReq.providerId) {
      res.status(500);
      return res.render('error', {
        error:
          `Provider mismatch: authentication started with id ${authReq.providerId},`
          + ` but callback for id ${providerId} was triggered`,
      });
    }

    const provider = this.store.getProvider(providerId);

    const providerIdentity = await provider.handleCallback(authReq.id, authReq.scopes, req.originalUrl);

    if (providerIdentity.error) {
      res.status(500);
      return res.render('error', { error: providerIdentity.error });
    }

    let account = this.store.getAccountByEmail(providerIdentity.email);

    if (account) {
      if (account.identities.findIndex(i => i.provider === providerId) < 0) {
        account.identities.push({
          provider: providerId,
          ...providerIdentity.data,
        });

        account.updated_at = Date.now();

        this.store.updateAccount(account);
      }
    } else {
      const now = Date.now();
      account = {
        id: nanoid(),
        username: providerIdentity.username,
        email: providerIdentity.email,
        name: providerIdentity.name,
        identities: [
          {
            provider: providerId,
            user_id: providerIdentity.id,
            ...providerIdentity.data,
          },
        ],
        created_at: now,
        updated_at: now,
      };

      this.store.createAccount(account);
    }

    // check scopes to create claims https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
    let claims = {};

    if (authReq.scopes.includes('profile')) {
      claims = {
        name: account.name,
        username: account.username,
      };
    }

    if (authReq.scopes.includes('email')) {
      claims = {
        ...claims,
        email: account.email,
        email_verified: true,
      };
    }

    if (authReq.scopes.includes('groups')) {
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

    this.store.deleteAuthReq(authReq.id);

    const { responseTypes, redirectURI } = authReq;

    const keystore = this.store.getKeystore();
    const key = keystore.get({ kty: 'RSA' });

    const oauth2 = new Oauth2(key);

    let accessToken;

    if (responseTypes.includes(responseTypeToken)) {
      accessToken = oauth2.newAccessToken(
        this.config.issuer,
        account.id,
        authReq.audience,
        authReq.clientId,
        authReq.scopes,
      );
    }

    const idToken = oauth2.newIdToken(
      this.config.issuer,
      account.id,
      authReq.clientId,
      authReq.nonce,
      claims,
      accessToken,
    );

    let values = {
      id_token: idToken,
      state: authReq.state,
    };

    if (accessToken) {
      values = {
        token_type: 'bearer',
        access_token: accessToken,
        ...values,
      };
    }

    return res.redirect(`${redirectURI}#${querystring.stringify(values)}`);
  };
}

export default ProviderCallbackHandler;
