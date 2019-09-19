import wrap from '../../wrap';
import { promptLogin, promptNone, promptTypes } from '../../../oauth2/consts';
import { parseAsArray } from '../../utils';

import { InvalidRequest } from './errors';

const checkPrompts = wrap(async (req, res, next) => {
  const { ctx, query } = req;

  const prompt = parseAsArray(query.prompt);

  if (prompt.length === 0) {
    prompt.push(promptLogin);
  }

  const unknownPrompts = prompt.filter(p => !promptTypes.includes(p));

  if (unknownPrompts && unknownPrompts.length > 0) {
    throw new InvalidRequest(`unknown prompt(s) ${unknownPrompts.join(', ')}`);
  }

  if (prompt.includes(promptNone) && prompt.length > 1) {
    throw new InvalidRequest('prompt \'none\' cannot be used with other values');
  }

  ctx.prompt = prompt;
  return next();
});

export default checkPrompts;
