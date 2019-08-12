class Store {
  constructor(opts) {
    this.opts = opts;
    this.authRequests = [];
  }

  getPublicKeystore = () => {
    const { keystore } = this.opts;

    return keystore.toJWKS(false);
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

    return providers.find(p => p.id === id);
  };

  getAuthReq = id => this.authRequests.find(a => a.id === id);

  createAuthReq = (authReq) => {
    this.authRequests.push(authReq);
  };

  updateAuthReq = (authReq) => {
    const index = this.authRequests.findIndex(a => a.id === authReq.id);

    this.authRequests[index] = authReq;
  };
}

export default Store;
