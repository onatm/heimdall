class Context {
  constructor({
    issuer, keystore, clients, providers, expiry,
  }) {
    this._issuer = issuer;
    this._keystore = keystore;
    this._clients = clients;
    this._providers = providers;
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

  get expiry() {
    return this._expiry;
  }
}

export default Context;
