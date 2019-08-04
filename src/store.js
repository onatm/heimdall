class Store {
  constructor(config) {
    this.config = config;
    this.authRequests = [];
  }

  getClient = (id) => {
    const { clients } = this.config;

    return clients.find(c => c.id === id);
  };

  getProviders = () => {
    const { providers } = this.config;
    return providers;
  };

  getProvider = (id) => {
    const { providers } = this.config;

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
