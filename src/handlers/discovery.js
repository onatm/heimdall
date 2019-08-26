/* eslint-disable babel/camelcase */
import { supportedResponseTypes } from '../consts';

class DiscoveryHandler {
  constructor(config) {
    this.config = config;
  }

  handle = async (_, res) => {
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
}

export default DiscoveryHandler;
