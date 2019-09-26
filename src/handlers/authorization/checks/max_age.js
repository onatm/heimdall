import wrap from '../../wrap';

import { InvalidRequest } from './errors';

const checkMaxAge = wrap(async (req, res, next) => {
  const { ctx: { maxAge } } = req;

  if (maxAge && (!parseInt(maxAge, 10) || maxAge < 0)) {
    throw new InvalidRequest('max_age must be a non-negative number');
  }

  return next();
});

export default checkMaxAge;
