/* eslint-disable babel/camelcase */
import ClientOAuth2 from 'client-oauth2';
import axios from 'axios';

const githubEmailScope = 'user:email';

class GithubProvider {
  constructor(config) {
    this.config = config;
  }

  getCallbackUrl = (authReqId, scopes) => {
    const {
      clientId, clientSecret, id, issuer,
    } = this.config;

    const githubScopes = scopes.includes('email') ? githubEmailScope : '';

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

    const githubScopes = scopes.includes('email') ? githubEmailScope : '';

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

    if (!token) {
      return { error: 'github: failed to get a token' };
    }

    const githubUser = await this.getUser(token);

    if (!githubUser) {
      return { error: 'github: failed to get user' };
    }

    const githubEmail = await this.getEmail(token);

    if (!githubEmail) {
      return { error: 'github: user has no verified, primary email' };
    }

    // TODO: check scope
    const groups = [];

    const identity = {
      ...githubUser,
      email: githubEmail.email,
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
        return undefined;
      }

      const user = {
        id: githubUser.id,
        name: githubUser.name,
        username: githubUser.login,
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

      return emails.find(e => e.primary && e.verified);
    } catch {
      return undefined;
    }
  };
}

export default GithubProvider;
