const handleDiscovery = async (req, res, next) => {
  const issuerURL = "http://localhost:3000";

  const discovery = {
    issuer: issuerURL,
    authorization_endpoint: `${issuerURL}/auth`,
    token_endpoint: `${issuerURL}/token`,
    jwks_uri: `${issuerURL}/keys`,
    userinfo_endpoint: `${issuerURL}/userinfo`,
    response_types_supported: [""],
    subject_types_supported: [""],
    id_token_signing_alg_values_supported: [""],
    scopes_supported: [""],
    token_endpoint_auth_methods_supported: [""],
    claims_supported: [""]
  };

  res.json(discovery);
};

export default handleDiscovery;