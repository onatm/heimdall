/* eslint-disable babel/camelcase */
import { JWT } from '@panva/jose';
import oidcTokenHash from 'oidc-token-hash';

const newAccessToken = (key, iss, sub, aud, azp, scopes, expiry) => {
  const accessToken = {
    iss,
    sub,
    aud,
    azp,
    scopes: scopes.join(' '),
  };

  return JWT.sign(accessToken, key, { expiresIn: expiry });
};

const newIdToken = (key, iss, sub, aud, nonce, claims, accessToken, expiry) => {
  let atHash;
  if (accessToken) {
    atHash = oidcTokenHash.generate(accessToken, key.alg);
  }

  const idToken = {
    iss,
    sub,
    aud,
    nonce,
    at_hash: atHash,
    ...claims,
  };

  return JWT.sign(idToken, key, { expiresIn: expiry });
};

const verifyAccessToken = (accessTokenJwt, key) => JWT.verify(accessTokenJwt, key);

export { newAccessToken, newIdToken, verifyAccessToken };
