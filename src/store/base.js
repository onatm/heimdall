class BaseStore {
  constructor({ keystore, providers, clients }) {
    this._keystore = keystore;
    this._providers = providers;
    this.clients = clients;
  }

  get keystore() {
    return this._keystore;
  }

  get providers() {
    return this._providers;
  }

  getProvider = id => this._providers.find(p => p.id === id);

  getClient = id => this.clients.find(c => c.id === id);
}

export default BaseStore;
