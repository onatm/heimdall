/* eslint-disable babel/camelcase */
import ClientOAuth2 from 'client-oauth2';
import axios from 'axios';

const apiUrl = 'https://api.github.com';
const emailScope = 'user:email';
const orgsScope = 'read:org';

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
      scopes: this.getScopes(scopes),
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
      scopes: this.getScopes(scopes),
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

    let identity = {
      ...githubUser,
      email: githubEmail.email,
    };

    if (scopes.includes('groups')) {
      const orgs = await this.getOrgs(token);

      if (!orgs) {
        return { error: 'github: failed to get orgs' };
      }

      const orgTeams = await this.getOrgTeams(token);

      if (!orgTeams) {
        return { error: 'github: failed to get teams' };
      }

      const groups = [];

      orgs.forEach((o) => {
        groups.push(o);
        const teams = orgTeams[o];
        if (teams) {
          teams.forEach((t) => {
            groups.push(`${o}:${t}`);
          });
        }
      });

      identity = {
        ...identity,
        groups,
      };
    }

    identity = {
      ...identity,
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
        url: `${apiUrl}/user`,
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
        url: `${apiUrl}/user/emails`,
      });
      const resp = await axios(emailsReq);

      const emails = resp.data;

      return emails.find(e => e.primary && e.verified);
    } catch {
      return undefined;
    }
  };

  getOrgs = async (token) => {
    try {
      const orgsRequest = token.sign({
        method: 'GET',
        url: `${apiUrl}/user/orgs`,
      });
      const resp = await axios(orgsRequest);

      const orgs = resp.data;

      return orgs.map(o => o.login);
    } catch (err) {
      return undefined;
    }
  };

  getOrgTeams = async (token) => {
    try {
      const orgTeamsRequest = token.sign({
        method: 'GET',
        url: `${apiUrl}/user/teams`,
      });
      const resp = await axios(orgTeamsRequest);

      const orgTeams = {};

      resp.data.forEach((ot) => {
        orgTeams[`${ot.organization.login}`] = [...orgTeams[`${ot.organization.login}`], ot.slug];
      });

      return orgTeams;
    } catch {
      return undefined;
    }
  };

  getScopes = (scopes) => {
    const githubScopes = [];

    if (scopes.includes('email')) {
      githubScopes.push(emailScope);
    }

    if (scopes.includes('groups')) {
      githubScopes.push(orgsScope);
    }

    return githubScopes.join(' ');
  };
}

export default GithubProvider;
