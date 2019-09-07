/* eslint-disable babel/camelcase */
import { JWT } from '@panva/jose';
import oidcTokenHash from 'oidc-token-hash';

const newAccessToken = (key, iss, sub, aud, azp, scopes, exp) => {
  const accessToken = {
    iss,
    sub,
    aud,
    azp,
    exp,
    scopes: scopes.join(' '),
  };

  return JWT.sign(accessToken, key);
};

const newIdToken = (key, iss, sub, aud, nonce, claims, accessToken, exp) => {
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
    exp,
  };

  return JWT.sign(idToken, key);
};

const verifyAccessToken = (accessTokenJwt, key) => JWT.verify(accessTokenJwt, key);

export { newAccessToken, newIdToken, verifyAccessToken };
