/* eslint-disable no-unused-vars */
import {
  InvalidClient, UnregisteredRedirectUri, InvalidRequest, UnsupportedResponseType, InvalidScope,
} from './authorization/checks/errors';

const errorHandler = async (err, req, res, next) => {
  if (err instanceof InvalidClient || err instanceof UnregisteredRedirectUri) {
    res.status(400);
    return res.render('error', { error: err.message });
  }

  if (err instanceof InvalidScope || err instanceof InvalidRequest || err instanceof UnsupportedResponseType) {
    const { ctx: { redirectURI, state } } = req;
    const { type, message } = err;
    return res.redirect(303, `${redirectURI}#error=${type}&error_description=${message}&state=${state}`);
  }

  res.status(500);
  return res.render('error', { error: err });
};

export default errorHandler;
