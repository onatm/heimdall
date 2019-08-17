import express from 'express';
import cors from 'cors';
import reactViews from 'express-react-views';

class App {
  constructor({ handler, port }) {
    this._app = express();
    this._app.set('port', port);
    this._app.use(cors());

    this._app.set('views', `${__dirname}/views`);
    this._app.set('view engine', 'jsx');
    this._app.engine('jsx', reactViews.createEngine());

    const router = express.Router();

    router.get('/.well-known/openid-configuration', handler.discoveryHandler);
    router.get('/token', (req, res) => res.send({ hello: 'world!' }));
    router.get('/jwks', handler.keystoreHandler);
    router.get('/userinfo', (req, res) => res.send({ hello: 'world!' }));
    router.get('/auth', handler.authorizationHandler);
    router.get('/auth/:provider', handler.providerHandler);
    router.get('/auth/:provider/callback', handler.providerCallbackHandler);
    router.get('/approval', (req, res) => res.send({ hello: 'world!' }));
    router.get('/healthz', (req, res) => res.send({ hello: 'world!' }));

    this._app.use('/', router);
  }

  get app() {
    return this._app;
  }
}

export default App;
