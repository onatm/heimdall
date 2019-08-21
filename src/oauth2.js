/* eslint-disable babel/camelcase */
import { JWT } from '@panva/jose';
import oidcTokenHash from 'oidc-token-hash';

class Oauth2 {
  constructor(key) {
    this.key = key;
  }

  newAccessToken = (iss, sub, aud, azp, scopes) => {
    const accessToken = {
      iss,
      sub,
      aud,
      azp,
      scopes: scopes.join(' '),
    };

    return JWT.sign(accessToken, this.key, { expiresIn: '24 hours' });
  };

  newIdToken = (iss, sub, aud, nonce, accessToken, claims, providerId) => {
    const atHash = oidcTokenHash.generate(accessToken, this.key.alg);

    const idToken = {
      iss,
      sub,
      aud,
      nonce,
      at_hash: atHash,
      email: claims.email,
      email_verified: claims.emailVerified,
      groups: claims.groups,
      name: claims.name,
      identities: [{
        user_id: claims.id,
        provider_id: providerId,
      }],
    };

    // add claims to token based on scopes

    return JWT.sign(idToken, this.key, { expiresIn: '24 hours' });
  };
}

export default Oauth2;