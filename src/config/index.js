import assert from 'assert';

import yaml from 'js-yaml';

import createProviders from './providers';
import createClients from './clients';

const defaultExpiry = {
  idToken: 86400,
  accessToken: 86400,
};

const createConfig = (file) => {
  const config = yaml.safeLoad(file);

  assert(config.issuer, 'heimdall: issuer is not specified.');
  // TODO: parse and validate issuer
  assert(config.mongoURI, 'heimdall: mongoURI is not specified.');

  if (!config.sessionKeys || !Array.isArray(config.sessionKeys)) {
    throw new Error('heimdall: sessionKey is not specified.');
  }

  const providers = createProviders(config);
  const clients = createClients(config);

  const expiry = { ...defaultExpiry, ...config.expiry };

  return {
    ...config, providers, clients, expiry,
  };
};

export default createConfig;
