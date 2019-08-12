import ClientOAuth2 from 'client-oauth2';
import axios from 'axios';

class GithubProvider {
  constructor(config) {
    this.config = config;
  }

  getCallbackUrl = (authReqId, scopes) => {
    const {
      clientId, clientSecret, id, issuer,
    } = this.config;

    const githubAuth = new ClientOAuth2({
      clientId,
      clientSecret,
      accessTokenUri: 'https://github.com/login/oauth/access_token',
      authorizationUri: 'https://github.com/login/oauth/authorize',
      redirectUri: `${issuer}/auth/${id}/callback`,
      state: authReqId,
      scopes,
    });

    return githubAuth.code.getUri();
  };

  handleCallback = async (authReqId, scopes, originalUrl) => {
    const {
      clientId, clientSecret, id, issuer,
    } = this.config;

    const githubAuth = new ClientOAuth2({
      clientId,
      clientSecret,
      accessTokenUri: 'https://github.com/login/oauth/access_token',
      authorizationUri: 'https://github.com/login/oauth/authorize',
      redirectUri: `${issuer}/auth/${id}/callback`,
      state: authReqId,
      scopes,
    });

    const token = await githubAuth.code.getToken(originalUrl);

    const userReq = token.sign({
      method: 'GET',
      url: 'https://api.github.com/user',
    });

    const user = await axios(userReq);

    return user.data;
  };
}

export default GithubProvider;
