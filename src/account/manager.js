class AccountManager {
  constructor(store) {
    this.store = store;
  }

  findAccount = async (identity, providerId) => {
    const account = await this.store.getAccountByEmail(identity.email);

    if (!account) {
      return this.createAccount(identity, providerId);
    }

    return this.store.updateAccount(account, identity, providerId);
  };

  createAccount = async (identity, providerId) => this.store.createAccount(identity, providerId);
}

export default AccountManager;
