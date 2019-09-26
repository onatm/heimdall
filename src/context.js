import { parseAsArray } from './handlers/utils';

class Context {
  constructor({
    params, issuer, keystore, clients, providers, store, manager, expiry,
  }) {
    this._params = params;
    this._issuer = issuer;
    this._keystore = keystore;
    this._clients = clients;
    this._providers = providers;
    this._store = store;
    this._manager = manager;
    this._expiry = expiry;
    this._authorization = {};
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

  authorization = (key, value) => {
    this._authorization[key] = value;
  };

  get clientId() {
    return this._params.client_id;
  }

  get redirectURI() {
    return this._params.redirect_uri;
  }

  get scopes() {
    return parseAsArray(this._params.scope);
  }

  get responseTypes() {
    return parseAsArray(this._params.response_type);
  }

  get maxAge() {
    return this._params.max_age;
  }

  get prompt() {
    return parseAsArray(this._params.prompt);
  }

  get state() {
    return this._params.state;
  }

  get nonce() {
    return this._params.nonce;
  }

  get client() {
    return this._authorization.Client;
  }

  get audience() {
    return this._authorization.Audience;
  }
}

export default Context;
