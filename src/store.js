class Store {
  constructor(opts) {
    this.opts = opts;
    this.authRequests = [];
  }

  getPublicJWKS = () => {
    const { keystore } = this.opts;

    return keystore.toJWKS(false);
  };

  getKeystore = () => {
    const { keystore } = this.opts;

    return keystore;
  };

  getClient = (id) => {
    const { clients } = this.opts;

    return clients.find(c => c.id === id);
  };

  getProviders = () => {
    const { providers } = this.opts;

    return providers;
  };

  getProvider = (id) => {
    const { providers } = this.opts;

    return providers.find(p => p.id === id).internal;
  };

  getAuthReq = id => this.authRequests.find(a => a.id === id);

  createAuthReq = (authReq) => {
    this.authRequests.push(authReq);
  };

  updateAuthReq = (authReq) => {
    const index = this.authRequests.findIndex(a => a.id === authReq.id);

    this.authRequests[index] = authReq;
  };

  deleteAuthReq = (id) => {
    const index = this.authRequests.findIndex(a => a.id === id);

    this.authRequests.splice(index);
  };
}

export default Store;
