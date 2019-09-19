import wrap from '../../wrap';

import { InvalidClient } from './errors';

const checkClient = wrap(async (req, res, next) => {
  const { ctx, query: { client_id: clientId } } = req;

  const client = ctx.clients.find(c => c.id === clientId);

  if (!client) {
    throw new InvalidClient(`Invalid client_id (${clientId})`);
  }

  ctx.client = client;
  return next();
});

export default checkClient;
