import assert from 'assert';

import GithubProvider from '../providers/github';

const createProviders = (config) => {
  if (!config.providers || config.providers.length === 0) {
    throw new Error('heimdall: no providers specified.');
  }

  return config.providers.map((p) => {
    assert(p.id, `heimdall: id is not specified for provider '${p.type}'.`);
    assert(p.name, `heimdall: name is not specified for provider '${p.type}'.`);
    assert(p.config, `heimdall: config parameters are not specified for provider '${p.type}'.`);
    assert(p.config.clientId, `heimdall: config parameter 'clientId' is not specified for provider '${p.type}'.`);
    assert(p.config.clientSecret, `heimdall: config parameter 'clientSecret' are not specified for provider '${p.type}'.`);
    switch (p.type) {
      case 'github':
      {
        return new GithubProvider({
          id: p.id,
          name: p.name,
          clientId: p.config.clientId,
          clientSecret: p.config.clientSecret,
          issuer: config.issuer,
        });
      }
      default:
        throw new Error(`heimdall: unknown provider type '${p.type}'.`);
    }
  });
};

export default createProviders;
