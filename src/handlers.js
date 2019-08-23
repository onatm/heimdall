/* eslint-disable babel/camelcase */
import querystring from 'querystring';

import nanoid from 'nanoid';
import { JWT } from '@panva/jose';

import Oauth2 from './oauth2';
import { supportedResponseTypes, responseTypeToken, responseTypeIdToken } from './consts';

const parseAsArray = (str) => {
  if (!str) {
    return undefined;
  }

  return str.split(' ');
};

class Handler {
  constructor(config, store) {
    this.config = config;
    this.store = store;
  }

  discoveryHandler = async (_, res) => {
    const { issuer } = this.config;

    const discovery = {
      issuer,
      authorization_endpoint: `${issuer}/auth`,
      jwks_uri: `${issuer}/jwks`,
      userinfo_endpoint: `${issuer}/userinfo`,
      scopes_supported: ['openid', 'profile', 'email', 'groups'],
      claims_supported:
        [
          'iss',
          'sub',
          'aud',
          'iat',
          'exp',
          'nonce',
          'name',
          'preferred_username',
          'picture',
          'email',
          'email_verified',
          'updated_at',
          'at_hash',
          'groups',
          'provider_claims',
        ],
      grant_types_supported: ['implicit'],
      response_types_supported: supportedResponseTypes,
      response_modes_supported: ['fragment'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
    };

    res.json(discovery);
  };

  keystoreHandler = async (req, res) => {
    res.json(this.store.getPublicJWKS());
  };

  authorizationHandler = async (req, res) => {
    const authReq = this.parseAuthorizationRequest(req.query);

    if (authReq.error) {
      return res.render('error', { error: authReq.error });
    }

    authReq.expiry = 'some time in the future';
    this.store.createAuthReq(authReq);

    const providers = this.store.getProviders();

    const providerInfos = providers.map(p => ({ id: p.id, name: p.name, url: `/auth/${p.id}?req=${authReq.id}` }));

    return res.render('authorization', { providerInfos });
  };

  providerHandler = async (req, res) => {
    const providerId = req.params.provider;

    const authReqId = req.query.req;

    const provider = this.store.getProvider(providerId);

    // TODO: check if provider is null

    const authReq = this.store.getAuthReq(authReqId);
    authReq.providerId = providerId;

    this.store.updateAuthReq(authReq);

    const callbackUrl = provider.getCallbackUrl(authReq.id, authReq.scopes);

    res.redirect(callbackUrl);
  };

  providerCallbackHandler = async (req, res) => {
    const authReqId = req.query.state;

    if (!authReqId) {
      return res.render('error', { error: 'User session error.' });
    }

    const authReq = this.store.getAuthReq(authReqId);

    if (!authReq) {
      return res.render('error', { error: "Invalid 'state' parameter provided: not found" });
    }

    const providerId = req.params.provider;

    if (providerId !== authReq.providerId) {
      return res.render('error', {
        error:
          `Provider mismatch: authentication started with id ${authReq.providerId},`
          + ` but callback for id ${providerId} was triggered`,
      });
    }

    const provider = this.store.getProvider(providerId);

    const providerIdentity = await provider.handleCallback(authReq.id, authReq.scopes, req.originalUrl);

    // TODO: if email is not verified, fail hard

    let account = this.store.getAccountByEmail(providerIdentity.email);

    if (account) {
      if (account.identities.findIndex(i => i.provider === providerId) < 0) {
        account.identities.push({
          provider: providerId,
          // scopes: authReq.scopes,
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
            // scopes: authReq.scopes,
            ...providerIdentity.data,
          },
        ],
        created_at: now,
        updated_at: now,
      };

      this.store.createAccount(account);
    }

    // TODO: check scopes to create claims https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims

    const claims = {
      name: account.name,
      username: account.username,
      email: account.email,
      email_verified: true,
      groups: providerIdentity.groups,
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
    let idToken;

    if (responseTypes.includes(responseTypeToken)) {
      accessToken = oauth2.newAccessToken(
        this.config.issuer,
        account.id,
        authReq.audience,
        authReq.clientId,
        authReq.scopes,
      );
    }

    if (responseTypes.includes(responseTypeIdToken)) {
      idToken = oauth2.newIdToken(
        this.config.issuer,
        account.id,
        authReq.clientId,
        authReq.nonce,
        claims,
        accessToken,
      );
    }

    let values = {
      state: authReq.state,
    };

    if (accessToken) {
      values = {
        token_type: 'bearer',
        access_token: accessToken,
        ...values,
      };
    }

    if (idToken) {
      values = {
        id_token: idToken,
        ...values,
      };
    }

    return res.redirect(`${redirectURI}#${querystring.stringify(values)}`);
  };

  // https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
  userInfoHandler = async (req, res) => {
    const { authorization } = req.headers;

    // header value's length should be greater than "Bearer " (7)
    if (!authorization || authorization.length < 7) {
      res.set({
        'WWW-Authenticate':
          [
            'Bearer',
            'error="invalid_token"',
          ],
      });
      return res.status(401).send();
    }

    const accessTokenJwt = authorization.slice(7);

    const keystore = this.store.getKeystore();
    const key = keystore.get({ kty: 'RSA' });

    const accessToken = JWT.verify(accessTokenJwt, key);

    const account = this.store.getAccountById(accessToken.sub);

    // TODO: create it based on scopes
    const userInfo = {
      sub: account.id,
      name: account.name,
      username: account.username,
      email: account.email,
      email_verified: true,
      groups: [],
      identities: account.identities,
    };

    // https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationResponse
    // we don't provide userinfo_signing_alg_values_supported so, continue with json response
    return res.send(userInfo);
  };

  parseAuthorizationRequest = (q) => {
    const { state, nonce, audience } = q;

    const redirectURI = q.redirect_uri;

    if (!redirectURI) {
      return { error: 'No redirect_uri provided.' };
    }

    const clientId = q.client_id;

    if (!clientId) {
      return { error: 'No client_id provided.' };
    }

    const client = this.store.getClient(clientId);

    if (!client) {
      return { error: `Invalid client_id (${clientId})` };
    }

    if (client.redirectURI !== redirectURI) {
      return { error: `Unregistered redirect_uri (${redirectURI})` };
    }

    if (!audience) {
      return { error: 'No audience provided.' };
    }

    const responseTypes = parseAsArray(q.response_type);

    if (!responseTypes) {
      return { error: 'No response_type provided.' };
    }

    // TODO: check invalid and unsupported response types

    const scopes = parseAsArray(q.scope);

    if (!scopes) {
      return { error: 'No scope provided.' };
    }

    // TODO: check unrecognized scopes and missing open_id scope

    // TODO: check nonce for implicit flow

    const id = nanoid();

    return {
      id, clientId, audience, responseTypes, scopes, state, nonce, redirectURI,
    };
  };
}

export default Handler;
