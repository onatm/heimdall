import crypto from 'crypto';

class Handler {
  constructor(config = { issuerURL }, store = { getClientById, getProviders, createAuthRequest }) {
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

    authReq.Expiry = "some time in the future";
    this.store.createAuthRequest(authReq);

    const providers = this.store.getProviders();

    const providerInfos = providers.map(p => { return ({ id: p.id, name: p.name, url: `/auth/${p.id}?req=${authReq.id}` }) });

    res.render("authorization", { providerInfos });
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

    const client = this.store.getClientById(clientId);

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