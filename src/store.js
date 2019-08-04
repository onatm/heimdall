class Store {
  constructor(config = { clients, providers }) {
    this.config = config;
    this.authRequests = [];
  }

  getClient = (id) => {
    const { clients } = this.config;

    return clients.find(c => c.id === id);
  }

  getProviders = () => {
    const { providers } = this.config;
    return providers;
  }

  getProvider = (id) => {
    const { providers } = this.config;

    return providers.find(p => p.id === id);
  }

  getAuthReq = (id) => {
    return this.authRequests.find(a => a.id === id);
  }

  createAuthReq = (authReq = { id, client, responseTypes, scopes, state, nonce, redirectURI, expiry, providerId }) => {
    this.authRequests.push(authReq);
  }

  updateAuthReq = (authReq = { id, client, responseTypes, scopes, state, nonce, redirectURI, expiry, providerId }) => {
    const index = this.authRequests.findIndex(a => a.id === authReq.id);

    this.authRequests[index] = authReq;
  }
}

export default Store;