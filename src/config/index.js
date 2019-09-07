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
  assert(config.sessionKey, 'heimdall: sessionKey is not specified.');

  const expiry = { ...defaultExpiry, ...config.expiry };

  const providers = createProviders(config);
  const clients = createClients(config);

  return {
    ...config, expiry, providers, clients,
  };
};

export default createConfig;
