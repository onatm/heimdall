import crypto from 'crypto';
import ClientOAuth2 from 'client-oauth2';
import axios from 'axios';

class Handler {
  constructor(
    config = { issuerURL },
    store = { getClient, getProviders, getProvider, getAuthReq, createAuthReq, updateAuthReq }) {
    this.config = config;
    this.store = store;
  }

  discoveryHandler = async (_, res) => {
    const { issuer, responseTypes } = this.config;

    const discovery = {
      issuer: issuer,
      authorization_endpoint: `${issuer}/auth`,
      token_endpoint: `${issuer}/token`,
      jwks_uri: `${issuer}/jwks`,
      userinfo_endpoint: `${issuer}/userinfo`,
      response_types_supported: responseTypes,
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "email", "groups", "profile", "offline_access"],
      token_endpoint_auth_methods_supported: ["client_secret_basic"],
      claims_supported: ["aud", "email", "email_verified", "exp", "iat", "iss", "locale", "name", "sub"]
    };

    res.json(discovery);
  }

  authorizationHandler = async (req, res) => {
    const authReq = this.parseAuthorizationRequest(req.query);

    if (authReq.error) {
      return res.render("error", { error: authReq.error })
    }

    authReq.expiry = "some time in the future";
    this.store.createAuthReq(authReq);

    const providers = this.store.getProviders();

    const providerInfos = providers.map(p => { return ({ id: p.id, name: p.name, url: `/auth/${p.id}?req=${authReq.id}` }) });

    res.render("authorization", { providerInfos });
  }

  providerHandler = async (req, res) => {
    const { issuer } = this.config;

    const providerId = req.params.provider;

    const provider = this.store.getProvider(providerId);

    const authReqId = req.query.req;

    const authReq = this.store.getAuthReq(authReqId);
    authReq.providerId = provider.id;

    this.store.updateAuthReq(authReq);

    const githubAuth = new ClientOAuth2({
      clientId: provider.config.clientId,
      clientSecret: provider.config.clientSecret,
      accessTokenUri: 'https://github.com/login/oauth/access_token',
      authorizationUri: 'https://github.com/login/oauth/authorize',
      redirectUri: `${issuer}/auth/${provider.id}/callback`,
      state: authReq.id,
      scopes: authReq.scopes
    });

    res.redirect(githubAuth.code.getUri());
  }

  providerCallbackHandler = async (req, res) => {
    const { issuer } = this.config;

    const authReqId = req.query.state;

    if (!authReqId) {
      return res.render("error", { error: "User session error." })
    }

    const authReq = this.store.getAuthReq(authReqId);

    if (!authReq) {
      return res.render("error", { error: "Invalid 'state' parameter provided: not found" })
    }

    const providerId = req.params.provider;

    if (providerId !== authReq.providerId) {
      return res.render("error", { error: `Provider mismatch: authentication started with id ${authReq.providerId}, but callback for id ${providerId} was triggered` })
    }

    const provider = this.store.getProvider(providerId);

    const githubAuth = new ClientOAuth2({
      clientId: provider.config.clientId,
      clientSecret: provider.config.clientSecret,
      accessTokenUri: 'https://github.com/login/oauth/access_token',
      authorizationUri: 'https://github.com/login/oauth/authorize',
      redirectUri: `${issuer}/auth/${provider.id}/callback`,
      state: authReq.id,
      scopes: authReq.scopes
    });

    const token = await githubAuth.code.getToken(req.originalUrl);

    // res.json({
    //   access_token: user.accessToken,
    //   refresh_token: user.refreshToken,
    //   token_type: user.tokenType
    // });

    const githubApiUrl = "https://api.github.com/api/v3";

    const userReq = token.sign({
      method: 'GET',
      url: 'https://api.github.com/user'
    });

    const user = await axios(userReq);

    return res.json(user.data);
  }

  parseAuthorizationRequest = (q) => {
    const state = q.state;
    const nonce = q.nonce;

    const redirectURI = q.redirect_uri;

    if (!redirectURI) {
      return { error: "No redirect_uri provided." };
    }

    const clientId = q.client_id;

    if (!clientId) {
      return { error: "No client_id provided." }
    }

    const client = this.store.getClient(clientId);

    if (!client) {
      return { error: `Invalid client_id (${clientId})` };
    }

    if (client.redirectURI !== redirectURI) {
      return { error: `Unregistered redirect_uri (${redirectURI})` }
    }

    const responseTypes = parseAsArray(q.response_type);

    if (!responseTypes) {
      return { error: "No response_type provided." };
    }

    // TODO: check invalid and unsupported response types

    const scopes = parseAsArray(q.scope);

    if (!scopes) {
      return { error: "No scope provided." };
    }

    // TODO: check unrecognized scopes and missing open_id scope

    // TODO: check nonce for implicit flow

    return { id: generateId(25), client, responseTypes, scopes, state, nonce, redirectURI };
  }
}

const parseAsArray = (str) => {
  if (!str) {
    return undefined;
  }

  return str.split(" ");
}

const generateId = (length) => {
  const chars = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
  const rnd = crypto.randomBytes(length)
  const value = new Array(length)
  let len = len = Math.min(256, chars.length)
  const d = 256 / len

  for (let i = 0; i < length; i++) {
    value[i] = chars[Math.floor(rnd[i] / d)]
  };

  return value.join('');
}

export default Handler;