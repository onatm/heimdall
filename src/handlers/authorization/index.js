import wrap from '../wrap';

const handleAuthorization = wrap(async (req, res) => {
  const {
    ctx: {
      providers,
      store,
      client: { id: clientId }, audience, responseTypes, scopes, state, nonce, redirectURI, maxAge, prompt,
    },
  } = req;

  const expiry = new Date(Date.now() + 1000 * 60 * 5).toISOString();

  const { id: authReqId } = await store.createAuthReq({
    clientId,
    audience,
    responseTypes,
    scopes,
    state,
    nonce,
    redirectURI,
    prompt,
    maxAge,
    expiry,
  });

  const providerInfos = providers.map(p => ({
    type: p.type,
    id: p.id,
    name: p.name,
    url: `/auth/${p.id}?req=${authReqId}`,
  }));

  return res.render('authorization', { providerInfos });
});

export default handleAuthorization;
