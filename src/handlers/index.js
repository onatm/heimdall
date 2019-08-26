import DiscoveryHandler from './discovery';
import KeystoreHandler from './keystore';
import AuthorizationHandler from './authorization';
import ProviderHandler from './provider';
import ProviderCallbackHandler from './provider.callback';
import UserInfoHandler from './user.info';

class Handler {
  constructor(config, store) {
    this._discoveryHandler = new DiscoveryHandler(config);
    this._keystoreHandler = new KeystoreHandler(store);
    this._authorizationHandler = new AuthorizationHandler(store);
    this._providerHandler = new ProviderHandler(store);
    this._providerCallbackHandler = new ProviderCallbackHandler(config, store);
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
