import wrap from '../../wrap';
import { responseTypeIdToken, responseTypeToken, supportedResponseTypes } from '../../../oauth2/consts';

import { InvalidRequest, UnsupportedResponseType } from './errors';

const checkResponseTypes = wrap(async (req, res, next) => {
  const { ctx: { responseTypes, nonce } } = req;

  if (responseTypes.length === 0) {
    throw new InvalidRequest('No response_type provided');
  }

  const invalidResponseTypes = responseTypes.filter(rt => rt !== responseTypeIdToken && rt !== responseTypeToken);

  if (invalidResponseTypes && invalidResponseTypes.length > 0) {
    throw new InvalidRequest(`Invalid response type(s) ${invalidResponseTypes.join(', ')}`);
  }

  const idTokenEnabled = responseTypes.includes(responseTypeIdToken);
  const tokenEnabled = responseTypes.includes(responseTypeToken);

  const unsupportedResponseTypes = responseTypes.filter(rt => !supportedResponseTypes.includes(rt));

  if (unsupportedResponseTypes && unsupportedResponseTypes.length > 0) {
    throw new UnsupportedResponseType(`Unsupported response type(s) ${unsupportedResponseTypes.join(', ')}`);
  }

  if (tokenEnabled && !idTokenEnabled) {
    throw new InvalidRequest('Response type \'token\' must be provided with type \'id_token\'');
  }

  if (tokenEnabled && !nonce) {
    throw new InvalidRequest('Response type \'token\' requires a \'nonce\' value');
  }

  return next();
});

export default checkResponseTypes;
