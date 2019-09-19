/* eslint-disable babel/camelcase */
import nanoid from 'nanoid';

class MemoryStore {
  constructor() {
    this.authRequests = [];
    this.accounts = [];
  }

  getAuthReq = async id => Promise.resolve(this.authRequests.find(a => a.id === id));

  createAuthReq = async (authReq) => {
    const newAuthReq = {
      id: nanoid(),
      ...authReq,
    };

    this.authRequests.push(newAuthReq);

    return Promise.resolve(newAuthReq);
  };

  updateAuthReq = async (id, providerId) => {
    const index = this.authRequests.findIndex(a => a.id === id);

    const authReq = this.authRequests[index];
    authReq.providerId = providerId;

    this.authRequests[index] = authReq;

    return Promise.resolve(authReq);
  };

  deleteAuthReq = async (id) => {
    const index = this.authRequests.findIndex(a => a.id === id);

    this.authRequests.splice(index);

    return Promise.resolve({});
  };

  getAccountById = async (id) => {
    const account = this.accounts.find(a => a.id === id);

    return Promise.resolve(account);
  };

  getAccountByEmail = async (email) => {
    const account = this.accounts.find(a => a.email === email);

    return Promise.resolve(account);
  };

  createAccount = async (identity, providerId) => {
    const account = {
      id: nanoid(),
      username: identity.username,
      email: identity.email,
      name: identity.name,
      identities: {},
    };

    account.identities[providerId] = {
      user_id: identity.id,
      ...identity.data,
    };

    this.accounts.push(account);

    return Promise.resolve(account);
  };

  updateAccount = async (account, identity, providerId) => {
    const index = this.accounts.findIndex(a => a.id === account.id);

    const updatedAccount = account;

    updatedAccount.identities[providerId] = {
      user_id: identity.id,
      ...identity.data,
    };

    this.accounts[index] = updatedAccount;

    return Promise.resolve(updatedAccount);
  };
}

export default MemoryStore;
