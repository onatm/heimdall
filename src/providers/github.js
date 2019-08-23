/* eslint-disable babel/camelcase */
import ClientOAuth2 from 'client-oauth2';
import axios from 'axios';

const scopeEmail = 'user:email';

class GithubProvider {
  constructor(config) {
    this.config = config;
  }

  getCallbackUrl = (authReqId, scopes) => {
    const {
      clientId, clientSecret, id, issuer,
    } = this.config;

    const githubScopes = `${scopes} ${scopeEmail}`;

    const githubAuth = new ClientOAuth2({
      clientId,
      clientSecret,
      accessTokenUri: 'https://github.com/login/oauth/access_token',
      authorizationUri: 'https://github.com/login/oauth/authorize',
      redirectUri: `${issuer}/auth/${id}/callback`,
      state: authReqId,
      scopes: githubScopes,
    });

    return githubAuth.code.getUri();
  };

  handleCallback = async (authReqId, scopes, originalUrl) => {
    const {
      clientId, clientSecret, id, issuer,
    } = this.config;

    const githubScopes = `${scopes} ${scopeEmail}`;

    const githubAuth = new ClientOAuth2({
      clientId,
      clientSecret,
      accessTokenUri: 'https://github.com/login/oauth/access_token',
      authorizationUri: 'https://github.com/login/oauth/authorize',
      redirectUri: `${issuer}/auth/${id}/callback`,
      state: authReqId,
      scopes: githubScopes,
    });

    const token = await githubAuth.code.getToken(originalUrl);

    const user = await this.getUser(token);

    if (!user) {
      // fail if missing
    }

    // get groups if scope provided

    const groups = [];

    const identity = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      email_verified: user.emailVerified,
      groups,
      data: {
        access_token: token.accessToken,
      },
    };

    return identity;
  };

  getUser = async (token) => {
    try {
      const userReq = token.sign({
        method: 'GET',
        url: 'https://api.github.com/user',
      });
      const resp = await axios(userReq);

      const githubUser = resp.data;

      if (!githubUser) {
        // fail
      }

      const githubEmail = await this.getEmail(token);

      if (!githubEmail) {
        // fail
      }

      const user = {
        id: githubUser.id,
        name: githubUser.name,
        username: githubUser.login,
        email: githubEmail.email,
        email_verified: githubEmail.verified,
      };

      return user;
    } catch {
      return undefined;
    }
  };

  getEmail = async (token) => {
    try {
      const emailsReq = token.sign({
        method: 'GET',
        url: 'https://api.github.com/user/emails',
      });
      const resp = await axios(emailsReq);

      const emails = resp.data;

      return emails.find(e => e.primary);
    } catch {
      return undefined;
    }
  };
}

export default GithubProvider;
