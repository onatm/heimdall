import wrap from '../../wrap';

import { UnregisteredRedirectUri } from './errors';

const checkRedirectUri = wrap(async (req, res, next) => {
  const { ctx: { client, redirectURI } } = req;

  if (client.redirectURI !== redirectURI) {
    throw new UnregisteredRedirectUri(`Unregistered redirect_uri (${redirectURI})`);
  }

  return next();
});

export default checkRedirectUri;
