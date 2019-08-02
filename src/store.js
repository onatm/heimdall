class Store {
  constructor(config = { clients, providers }) {
    this.config = config;
    this.authRequests = [];
  }

  getClientById = (id) => {
    const { clients } = this.config;

    return clients.find(c => c.id === id);
  }

  getProviders = () => {
    const { providers } = this.config;
    return providers;
  }

  createAuthRequest = (authReq = { id, client, responseTypes, scopes, state, nonce, redirectURI, expiry }) => {
    this.authRequests.push(authReq);
  }
}

export default Store;