class ProviderHandler {
  constructor(store) {
    this.store = store;
  }

  handle = async (req, res) => {
    const providerId = req.params.provider;

    const authReqId = req.query.req;

    const provider = this.store.getProvider(providerId);

    // TODO: check if provider is null

    const authReq = this.store.getAuthReq(authReqId);
    authReq.providerId = providerId;

    this.store.updateAuthReq(authReq);

    const callbackUrl = provider.getCallbackUrl(authReq.id, authReq.scopes);

    res.redirect(callbackUrl);
  };
}

export default ProviderHandler;
