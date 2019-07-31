class Handler {
  constructor(config = { issuerURL }) {
    this.config = config;
    this.discoveryHandler = this.discoveryHandler.bind(this);
  }

  async discoveryHandler(_, res) {
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
}

export default Handler;