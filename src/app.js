import path from 'path';

import express from 'express';
import helmet from 'helmet';
import cookieSession from 'cookie-session';
import cors from 'cors';
import reactViews from 'express-react-views';

import checkClient from './handlers/authorization/checks/client';
import checkRedirectUri from './handlers/authorization/checks/redirect_uri';
import Context from './context';
import errorHandler from './handlers/error';
import checkResponseTypes from './handlers/authorization/checks/response_types';
import checkScopes from './handlers/authorization/checks/scopes';
import checkMaxAge from './handlers/authorization/checks/max_age';
import checkPrompts from './handlers/authorization/checks/prompt';

class App {
  constructor({
    issuer, keystore, clients, providers, expiry, handler, port, sessionKeys,
  }) {
    this._app = express();
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
          issuer, keystore, clients, providers, expiry,
        }),
      });
      next();
    });

    const router = express.Router();


    const {
      discoveryHandler, keystoreHandler, authorizationHandler, providerHandler, providerCallbackHandler, userInfoHandler,
    } = handler;

    const authChecks = [
      checkClient,
      checkRedirectUri,
      checkScopes,
      checkResponseTypes,
      checkMaxAge,
      checkPrompts,
    ];

    router.get('/.well-known/openid-configuration', discoveryHandler.handle);
    router.get('/jwks', keystoreHandler.handle);
    router.get('/auth', authChecks, authorizationHandler.handle);
    router.get('/auth/:provider', providerHandler.handle);
    router.get('/auth/:provider/callback', providerCallbackHandler.handle);
    router.get('/userinfo', userInfoHandler.handle);

    this._app.use('/', router);
    this._app.use(errorHandler);
  }

  get app() {
    return this._app;
  }
}

export default App;
