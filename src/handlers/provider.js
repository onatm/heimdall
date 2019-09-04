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

    const { id, scopes } = await this.store.updateAuthReq(authReqId, providerId);

    const callbackUrl = provider.getCallbackUrl(id, scopes);

    return res.redirect(callbackUrl);
  };
}

export default ProviderHandler;
