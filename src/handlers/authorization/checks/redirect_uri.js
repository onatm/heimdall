import wrap from '../../wrap';

import { UnregisteredRedirectUri } from './errors';

const checkRedirectUri = wrap(async (req, res, next) => {
  const { ctx, query: { redirect_uri: redirectURI, state } } = req;

  if (ctx.client.redirectURI !== redirectURI) {
    throw new UnregisteredRedirectUri(`Unregistered redirect_uri (${redirectURI})`);
  }

  ctx.redirectURI = redirectURI;
  ctx.state = state;
  return next();
});

export default checkRedirectUri;
