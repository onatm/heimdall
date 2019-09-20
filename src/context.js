class Context {
  constructor({
    issuer, keystore, clients, providers, store, manager, expiry,
  }) {
    this._issuer = issuer;
    this._keystore = keystore;
    this._clients = clients;
    this._providers = providers;
    this._store = store;
    this._manager = manager;
    this._expiry = expiry;
  }

  get issuer() {
    return this._issuer;
  }

  get keystore() {
    return this._keystore;
  }

  get clients() {
    return this._clients;
  }

  get providers() {
    return this._providers;
  }

  get store() {
    return this._store;
  }

  get manager() {
    return this._manager;
  }

  get expiry() {
    return this._expiry;
  }
}

export default Context;
