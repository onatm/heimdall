/* eslint-disable babel/camelcase */
import { JWT } from '@panva/jose';

class UserInfo {
  constructor(store) {
    this.store = store;
  }

  // https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
  handle = async (req, res) => {
    const { authorization } = req.headers;

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

    const keystore = this.store.getKeystore();
    const key = keystore.get({ kty: 'RSA' });

    const accessToken = JWT.verify(accessTokenJwt, key);

    const account = this.store.getAccountById(accessToken.sub);

    // TODO: create it based on scopes
    const userInfo = {
      sub: account.id,
      name: account.name,
      username: account.username,
      email: account.email,
      email_verified: true,
      groups: [],
      identities: account.identities,
    };

    // https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationResponse
    // we don't provide userinfo_signing_alg_values_supported so, continue with json response
    return res.send(userInfo);
  };
}

export default UserInfo;
