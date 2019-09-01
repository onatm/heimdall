class ProviderHandler {
  constructor(store) {
    this.store = store;
  }

  handle = async (req, res) => {
    const providerId = req.params.provider;

    const authReqId = req.query.req;

    const provider = this.store.getProvider(providerId);

    if (!provider) {
      res.status(500);
      return res.render('error', { error: 'Requested provider does not exist' });
    }

    const authReq = this.store.getAuthReq(authReqId);
    authReq.providerId = providerId;

    this.store.updateAuthReq(authReq);

    const callbackUrl = provider.getCallbackUrl(authReq.id, authReq.scopes);

    return res.redirect(callbackUrl);
  };
}

export default ProviderHandler;
