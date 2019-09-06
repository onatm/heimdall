class BaseStore {
  constructor({ keystore, clients, providers }) {
    this._keystore = keystore;
    this.clients = clients;
    this.providers = providers;
  }

  get keystore() {
    return this._keystore;
  }

  getClient = id => this.clients.find(c => c.id === id);

  getProviders = () => this.providers;

  getProvider = id => this.providers.find(p => p.id === id);
}

export default BaseStore;
