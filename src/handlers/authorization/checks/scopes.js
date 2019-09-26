import wrap from '../../wrap';
import {
  scopeOpenId, scopeProfile, scopeEmail, scopeGroups, scopeAudiencePrefix,
} from '../../../oauth2/consts';

import { InvalidScope } from './errors';

const checkScopes = wrap(async (req, res, next) => {
  const { ctx } = req;
  const { client, scopes } = ctx;

  if (!scopes.includes(scopeOpenId)) {
    throw new InvalidScope('Missing required scope(s) [\'openid\']');
  }

  const audience = [];
  const invalidScopes = [];
  const unrecognizedScopes = [];

  scopes
    .filter(scope => scope !== scopeOpenId && scope !== scopeProfile && scope !== scopeEmail && scope !== scopeGroups)
    .forEach((scope) => {
      if (scope.startsWith(scopeAudiencePrefix)) {
        const audienceScope = scope.slice(9);
        if (client.audience && client.audience.includes(audienceScope)) {
          audience.push(audienceScope);
        } else {
          invalidScopes.push(scope);
        }
      } else if (!client.scopes || !client.scopes.includes(scope)) {
        unrecognizedScopes.push(scope);
      }
    });

  if (unrecognizedScopes.length > 0) {
    throw new InvalidScope(`Unrecognized scope(s) ${unrecognizedScopes.join(', ')}`);
  }

  if (invalidScopes.length > 0) {
    throw new InvalidScope(`Client cannot request scope(s) ${invalidScopes.join(', ')}`);
  }

  ctx.authorization('Audience', audience);

  return next();
});

export default checkScopes;
