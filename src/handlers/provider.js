const handleProvider = async (req, res) => {
  const { ctx: { providers, store }, params: { provider: providerId }, query: { req: authReqId } } = req;

  const provider = providers.find(p => p.id === providerId);

  if (!provider) {
    res.status(500);
    return res.render('error', { error: 'Requested provider does not exist' });
  }

  const { id, scopes } = await store.updateAuthReq(authReqId, providerId);

  const callbackUrl = provider.getCallbackUrl(id, scopes);

  return res.redirect(callbackUrl);
};

export default handleProvider;
