import path from 'path';

import express from 'express';
import cors from 'cors';
import reactViews from 'express-react-views';

class App {
  constructor({ handler, port }) {
    this._app = express();
    this._app.set('port', port);
    this._app.use(cors());

    this._app.use(express.static(path.join(__dirname, 'public')));
    this._app.set('views', path.join(__dirname, 'views'));
    this._app.set('view engine', 'jsx');
    this._app.engine('jsx', reactViews.createEngine());

    const router = express.Router();

    router.get('/.well-known/openid-configuration', handler.discoveryHandler);
    router.get('/jwks', handler.keystoreHandler);
    router.get('/userinfo', handler.userInfoHandler);
    router.get('/auth', handler.authorizationHandler);
    router.get('/auth/:provider', handler.providerHandler);
    router.get('/auth/:provider/callback', handler.providerCallbackHandler);

    this._app.use('/', router);
  }

  get app() {
    return this._app;
  }
}

export default App;
