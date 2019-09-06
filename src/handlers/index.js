import DiscoveryHandler from './discovery';
import KeystoreHandler from './keystore';
import AuthorizationHandler from './authorization';
import ProviderHandler from './provider';
import ProviderCallbackHandler from './provider.callback';
import UserInfoHandler from './user.info';

class Handler {
  constructor({ issuer, expiry }, store, accountManager) {
    const { keystore } = store;
    this._discoveryHandler = new DiscoveryHandler({ issuer });
    this._keystoreHandler = new KeystoreHandler(keystore);
    this._authorizationHandler = new AuthorizationHandler(store);
    this._providerHandler = new ProviderHandler(store);
    this._providerCallbackHandler = new ProviderCallbackHandler({ issuer, expiry }, store, accountManager);
    this._userInfoHandler = new UserInfoHandler(store);
  }

  get discoveryHandler() {
    return this._discoveryHandler;
  }

  get keystoreHandler() {
    return this._keystoreHandler;
  }

  get authorizationHandler() {
    return this._authorizationHandler;
  }

  get providerHandler() {
    return this._providerHandler;
  }

  get providerCallbackHandler() {
    return this._providerCallbackHandler;
  }

  get userInfoHandler() {
    return this._userInfoHandler;
  }
}

export default Handler;
