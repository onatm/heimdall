import assert from 'assert';

const createClients = (config) => {
  if (!config.clients || config.clients.length === 0) {
    throw new Error('heimdall: no clients specified.');
  }

  return config.clients.map((c) => {
    assert(c.id, 'heimdall: id is not specified for client.');
    assert(c.redirectURI, 'heimdall: redirectURI is not specified for client');
    // TODO: parse and validate redirectURI
    if (c.audience && !Array.isArray(c.audience)) {
      throw new Error('heimdall: client audience should be an array.');
    }
    if (c.scopes && !Array.isArray(c.scopes)) {
      throw new Error('heimdall: client scopes should be an array.');
    }
    return c;
  });
};

export default createClients;
