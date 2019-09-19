/* eslint-disable babel/camelcase */
import Account from '../models/account';
import AuthReq from '../models/authorization.request';

class MongoStore {
  getAuthReq = async id => AuthReq.findOne({ _id: id, expiry: { $gte: new Date().toISOString() }, is_active: true });

  createAuthReq = async authReq => new AuthReq({ ...authReq }).save();

  updateAuthReq = async (id, providerId) => AuthReq.findByIdAndUpdate(id, { $set: { provider_id: providerId } }, { new: true });

  deleteAuthReq = async id => AuthReq.findByIdAndUpdate(id, { $set: { is_active: false } }, { new: true });

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

    const updatedAccount = await Account.findByIdAndUpdate(account.id, { $set: { identities } }, { new: true });

    return updatedAccount;
  };
}

export default MongoStore;
