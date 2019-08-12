/* eslint-disable babel/camelcase */
import nanoid from 'nanoid';

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
    const { issuer, responseTypes } = this.config;

    const discovery = {
      issuer,
      authorization_endpoint: `${issuer}/auth`,
      token_endpoint: `${issuer}/token`,
      jwks_uri: `${issuer}/jwks`,
      userinfo_endpoint: `${issuer}/userinfo`,
      response_types_supported: responseTypes,
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'email', 'groups', 'profile', 'offline_access'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
      claims_supported: ['aud', 'email', 'email_verified', 'exp', 'iat', 'iss', 'locale', 'name', 'sub'],
    };

    res.json(discovery);
  };

  keystoreHandler = async (req, res) => {
    res.json(this.store.getPublicKeystore());
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
      return res.render('error', { error: `Provider mismatch: authentication started with id ${authReq.providerId}, but callback for id ${providerId} was triggered` });
    }

    const provider = this.store.getProvider(providerId);

    const identity = await provider.handleCallback(authReq.id, authReq.scopes, req.originalUrl);

    return res.json(identity);
  };

  parseAuthorizationRequest = (q) => {
    const { state } = q;
    const { nonce } = q;

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
      id, client, responseTypes, scopes, state, nonce, redirectURI,
    };
  };
}

export default Handler;
