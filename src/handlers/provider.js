class ProviderHandler {
  constructor(store) {
    this.store = store;
  }

  handle = async (req, res) => {
    const { ctx: { providers }, params: { provider: providerId }, query: { req: authReqId } } = req;

    const provider = providers.find(p => p.id === providerId);

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
