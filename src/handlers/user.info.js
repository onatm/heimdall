/* eslint-disable babel/camelcase */
import { verifyAccessToken } from '../oauth2';

import { parseAsArray } from './utils';


// https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
// groups are not included to user info
const handleUserInfo = async (req, res) => {
  const { ctx: { keystore, store }, headers: { authorization } } = req;

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

  const key = keystore.get({ kty: 'RSA' });

  const accessToken = verifyAccessToken(accessTokenJwt, key);

  const account = await store.getAccountById(accessToken.sub);

  const scopes = parseAsArray(accessToken.scopes);

  let userInfo = {
    sub: account.id,
  };

  if (scopes.includes('profile')) {
    userInfo = {
      name: account.name,
      preferred_username: account.username,
    };
  }

  if (scopes.includes('email')) {
    userInfo = {
      ...userInfo,
      email: account.email,
      email_verified: true,
    };
  }

  userInfo = {
    ...userInfo,
    identities: account.identities,
  };

  // https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationResponse
  // we don't provide userinfo_signing_alg_values_supported so, continue with json response
  return res.send(userInfo);
};

export default handleUserInfo;
