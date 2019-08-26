import nanoid from 'nanoid';

const parseAsArray = (str) => {
  if (!str) {
    return undefined;
  }

  return str.split(' ');
};

class AuthorizationHandler {
  constructor(store) {
    this.store = store;
  }

  handle = async (req, res) => {
    const authReq = this.parseAuthorizationRequest(req.query);

    if (authReq.error) {
      return res.render('error', { error: authReq.error });
    }

    authReq.expiry = 'some time in the future';
    this.store.createAuthReq(authReq);

    const providers = this.store.getProviders();

    const providerInfos = providers.map(p => ({
      id: p.id,
      type: p.type,
      name: p.name,
      url: `/auth/${p.id}?req=${authReq.id}`,
    }));

    return res.render('authorization', { providerInfos });
  };

  parseAuthorizationRequest = (q) => {
    const { state, nonce, audience } = q;

    const redirectURI = q.redirect_uri;

    if (!redirectURI) {
      return { error: 'No redirect_uri provided.' };
    }

    const clientId = q.client_id;

    if (!clientId) {
      return { error: 'No client_id provided.' };
    }

    const client = this.store.getClient(clientId);

    if (!client) {
      return { error: `Invalid client_id (${clientId})` };
    }

    if (client.redirectURI !== redirectURI) {
      return { error: `Unregistered redirect_uri (${redirectURI})` };
    }

    if (!audience) {
      return { error: 'No audience provided.' };
    }

    const responseTypes = parseAsArray(q.response_type);

    if (!responseTypes) {
      return { error: 'No response_type provided.' };
    }

    // TODO: check invalid and unsupported response types

    const scopes = parseAsArray(q.scope);

    if (!scopes) {
      return { error: 'No scope provided.' };
    }

    // TODO: check unrecognized scopes and missing open_id scope

    // TODO: check nonce for implicit flow

    const id = nanoid();

    return {
      id, clientId, audience, responseTypes, scopes, state, nonce, redirectURI,
    };
  };
}

export default AuthorizationHandler;
