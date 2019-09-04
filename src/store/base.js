class BaseStore {
  constructor({ keystore, clients, providers }) {
    this.keystore = keystore;
    this.clients = clients;
    this.providers = providers;
  }

  getPublicJWKS = () => this.keystore.toJWKS(false);

  getKeystore = () => this.keystore;

  getClient = id => this.clients.find(c => c.id === id);

  getProviders = () => this.providers;

  getProvider = id => this.providers.find(p => p.id === id).internal;
}

export default BaseStore;
