import path from 'path';

import express from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import reactViews from 'express-react-views';

class App {
  constructor({ handler, port, sessionKey }) {
    this._app = express();
    this._app.set('port', port);
    this._app.use(cors());
    this._app.use(cookieSession({
      name: 'heimdall',
      keys: [sessionKey],
      httpOnly: true,
      maxAge: 360 * 24 * 60 * 100,
    }));

    this._app.use(express.static(path.join(__dirname, 'public')));
    this._app.set('views', path.join(__dirname, 'views'));
    this._app.set('view engine', 'js');
    this._app.engine('js', reactViews.createEngine());

    const router = express.Router();

    const {
      discoveryHandler, keystoreHandler, authorizationHandler, providerHandler, providerCallbackHandler, userInfoHandler,
    } = handler;

    router.get('/.well-known/openid-configuration', discoveryHandler.handle);
    router.get('/jwks', keystoreHandler.handle);
    router.get('/auth', authorizationHandler.handle);
    router.get('/auth/:provider', providerHandler.handle);
    router.get('/auth/:provider/callback', providerCallbackHandler.handle);
    router.get('/userinfo', userInfoHandler.handle);

    this._app.use('/', router);
  }

  get app() {
    return this._app;
  }
}

export default App;
