/* eslint-disable babel/camelcase */
import Account from '../models/account';
import AuthReq from '../models/authorization.request';

import BaseStore from './base';

class MongoStore extends BaseStore {
  constructor({ keystore, clients, providers }) {
    super({ keystore, clients, providers });
  }

  getAuthReq = async id => AuthReq.findById(id);

  createAuthReq = async authReq => new AuthReq({ ...authReq }).save();

  updateAuthReq = async (id, providerId) => AuthReq.findByIdAndUpdate(id, { $set: { provider_id: providerId } });

  deleteAuthReq = async id => AuthReq.findByIdAndRemove(id);

  getAccountById = async id => Account.findById(id);

  getAccountByEmail = async email => Account.findOne({ email });

  createAccount = async (identity, providerId) => {
    const account = {
      username: identity.username,
      email: identity.email,
      name: identity.name,
      identities: {},
    };

    account.identities[providerId] = {
      user_id: identity.id,
      ...identity.data,
    };

    return new Account({ ...account }).save();
  };

  updateAccount = async (account, identity, providerId) => {
    const { identities } = account;

    identities.set(providerId, { user_id: identity.id, ...identity.data });

    const updatedAccount = await Account.findByIdAndUpdate(account.id, { $set: { identities } });

    return updatedAccount;
  };
}

export default MongoStore;
