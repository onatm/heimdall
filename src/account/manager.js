/* eslint-disable babel/camelcase */
import nanoid from 'nanoid';

class AccountManager {
  constructor(store) {
    this.store = store;
  }

  findAccount = (providerIdentity, providerId) => {
    const now = Date.now();
    const account = this.store.getAccountByEmail(providerIdentity.email);

    if (!account) {
      return this.createAccount(providerIdentity, providerId, now);
    }

    account.identities[providerId] = {
      user_id: providerIdentity.id,
      ...providerIdentity.data,
    };

    account.updated_at = now;

    this.store.updateAccount(account);

    return account;
  };

  createAccount = (providerIdentity, providerId, now) => {
    const account = {
      id: nanoid(),
      username: providerIdentity.username,
      email: providerIdentity.email,
      name: providerIdentity.name,
      identities: {},
      created_at: now,
      updated_at: now,
    };

    account.identities[providerId] = {
      user_id: providerIdentity.id,
      ...providerIdentity.data,
    };

    this.store.createAccount(account);

    return account;
  };
}

export default AccountManager;
