const responseTypeIdToken = 'id_token';
const responseTypeToken = 'token';

const supportedResponseTypes = [responseTypeToken, responseTypeIdToken, `${responseTypeIdToken} ${responseTypeToken}`];

const scopeOpenId = 'openid';
const scopeProfile = 'profile';
const scopeEmail = 'email';
const scopeGroups = 'groups';
const scopeAudiencePrefix = 'audience:';

const supportedScopes = [scopeOpenId, scopeProfile, scopeEmail, scopeGroups];

export {
  supportedResponseTypes,
  responseTypeToken,
  responseTypeIdToken,
  supportedScopes,
  scopeOpenId,
  scopeProfile,
  scopeEmail,
  scopeGroups,
  scopeAudiencePrefix,
};
