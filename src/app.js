import path from 'path';

import express from 'express';
import helmet from 'helmet';
import cookieSession from 'cookie-session';
import cors from 'cors';
import reactViews from 'express-react-views';
import morgan from 'morgan';

import Context from './context';
import checkClient from './handlers/authorization/checks/client';
import checkRedirectUri from './handlers/authorization/checks/redirect_uri';
import checkResponseTypes from './handlers/authorization/checks/response_types';
import checkScopes from './handlers/authorization/checks/scopes';
import checkMaxAge from './handlers/authorization/checks/max_age';
import checkPrompts from './handlers/authorization/checks/prompt';
import handleError from './handlers/error';
import handleUserInfo from './handlers/user.info';
import handleProvider from './handlers/provider';
import handleKeystore from './handlers/keystore';
import handleProviderCallback from './handlers/provider.callback';
import handleDiscovery from './handlers/discovery';
import handleAuthorization from './handlers/authorization';
import logger from './logger';

class App {
  constructor({
    issuer, keystore, clients, providers, store, manager, expiry, port, sessionKeys,
  }) {
    this._app = express();
    this._app.use(morgan('short', { stream: { write: message => logger.info(message) } }));
    this._app.set('port', port);
    this._app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
        },
      },
    }));
    this._app.use(cors());
    this._app.use(cookieSession({
      name: 'heimdall',
      keys: sessionKeys,
      httpOnly: true,
      maxAge: 360 * 24 * 60 * 100,
    }));

    this._app.use(express.static(path.join(__dirname, 'public')));
    this._app.set('views', path.join(__dirname, 'views'));
    this._app.set('view engine', 'js');
    this._app.engine('js', reactViews.createEngine());

    this._app.use((req, _, next) => {
      Object.defineProperty(req, 'ctx', {
        value: new Context({
          params: { ...req.query, ...req.params }, issuer, keystore, clients, providers, store, manager, expiry,
        }),
      });
      next();
    });

    const router = express.Router();

    const authHandlers = [
      checkClient,
      checkRedirectUri,
      checkScopes,
      checkResponseTypes,
      checkMaxAge,
      checkPrompts,
      handleAuthorization,
    ];

    router.get('/.well-known/openid-configuration', handleDiscovery);
    router.get('/jwks', handleKeystore);
    router.get('/auth', authHandlers);
    router.get('/auth/:provider', handleProvider);
    router.get('/auth/:provider/callback', handleProviderCallback);
    router.get('/userinfo', handleUserInfo);

    this._app.use('/', router);
    this._app.use(handleError);
  }

  get app() {
    return this._app;
  }
}

export default App;
