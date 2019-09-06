import {
  supportedResponseTypes,
  responseTypeToken,
  responseTypeIdToken,
  scopeOpenId,
  scopeProfile,
  scopeEmail,
  scopeGroups,
  scopeAudiencePrefix,
} from '../oauth2/consts';

import { parseAsArray } from './utils';

class AuthorizationHandler {
  constructor(store) {
    this.store = store;
  }

  handle = async (req, res) => {
    const authReq = this.parseAuthorizationRequest(req.query);

    if (authReq.error) {
      const { error: { type, message, redirectURI } } = authReq;
      if (type === 'redirect') {
        return res.redirect(303, redirectURI);
      }

      res.status(400);
      return res.render('error', { error: message });
    }

    const { id: authReqId } = await this.store.createAuthReq(authReq);

    const { providers } = this.store;

    const providerInfos = providers.map(p => ({
      type: p.type,
      id: p.id,
      name: p.name,
      url: `/auth/${p.id}?req=${authReqId}`,
    }));

    return res.render('authorization', { providerInfos });
  };

  parseAuthorizationRequest = (q) => {
    const {
      client_id: clientId, redirect_uri: redirectURI, state, nonce,
    } = q;

    const client = this.store.getClient(clientId);

    if (!client) {
      return {
        error: {
          type: 'render',
          message: `Invalid client_id (${clientId})`,
        },
      };
    }

    if (client.redirectURI !== redirectURI) {
      return {
        error: {
          type: 'render',
          message: `Unregistered redirect_uri (${redirectURI})`,
        },
      };
    }

    const redirectError = (error, description) => ({
      error: {
        type: 'redirect',
        redirectURI: `${redirectURI}&error=${error}&error_description=${description}&state=${state}`,
      },
    });

    const scopes = parseAsArray(q.scope);

    let hasOpenIdScope = false;
    const audience = [];
    const invalidScopes = [];
    const unrecognizedScopes = [];

    for (let i = 0; i < scopes.length; i++) {
      switch (scopes[i]) {
        case scopeOpenId:
          hasOpenIdScope = true;
          break;
        case scopeProfile:
        case scopeEmail:
        case scopeGroups:
          break;
        default:
          if (scopes[i].startsWith(scopeAudiencePrefix)) {
            const audienceScope = scopes[i].slice(9);
            if (client.audience.includes(audienceScope)) {
              audience.push(audienceScope);
            } else {
              invalidScopes.push(scopes[i]);
            }
          } else if (!client.scopes || !client.scopes.includes(scopes[i])) {
            unrecognizedScopes.push(scopes[i]);
          }
          break;
      }
    }

    if (!hasOpenIdScope) {
      return redirectError('invalid_scope', 'Missing required scope(s) [\'openid\']');
    }

    if (unrecognizedScopes.length > 0) {
      return redirectError('invalid_scope', `Unrecognized scope(s) ${unrecognizedScopes.join(', ')}`);
    }

    if (invalidScopes.length > 0) {
      return redirectError('invalid_scope', `Client cannot request scope(s) ${invalidScopes.join(', ')}`);
    }

    const responseTypes = parseAsArray(q.response_type);

    if (responseTypes.length === 0) {
      return redirectError('invalid_request', 'No response_type provided');
    }

    let idTokenEnabled = false;
    let tokenEnabled = false;

    for (let i = 0; i < responseTypes.length; i++) {
      switch (responseTypes[i]) {
        case responseTypeIdToken:
          idTokenEnabled = true;
          break;
        case responseTypeToken:
          tokenEnabled = true;
          break;
        default:
          return redirectError('invalid_request', `Invalid response type ${responseTypes[i]}`);
      }

      if (!supportedResponseTypes.includes(responseTypes[i])) {
        return redirectError('unsupported_response_type', `Unsupported response type ${responseTypes[i]}`);
      }
    }

    if (tokenEnabled && !idTokenEnabled) {
      return redirectError('invalid_request', 'Response type \'token\' must be provided with type \'id_token\'');
    }

    if (tokenEnabled && !nonce) {
      return redirectError('invalid_request', 'Response type \'token\' requires a \'nonce\' value');
    }

    const expiry = new Date(Date.now() + 1000 * 60 * 5).toISOString();

    return {
      clientId, audience, responseTypes, scopes, state, nonce, redirectURI, expiry,
    };
  };
}

export default AuthorizationHandler;
