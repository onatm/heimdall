import wrap from '../../wrap';

import { InvalidClient } from './errors';

const checkClient = wrap(async (req, res, next) => {
  const { ctx } = req;
  const { clientId } = ctx;

  const client = ctx.clients.find(c => c.id === clientId);

  if (!client) {
    throw new InvalidClient(`Invalid client_id (${clientId})`);
  }

  ctx.authorization('Client', client);

  return next();
});

export default checkClient;
