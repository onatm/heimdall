import express from 'express';
import cors from 'cors';
import reactViews from 'express-react-views';

class App {
  constructor({ handler, port } = opts) {
    this.app = express();
    this.app.set('port', port);
    this.app.use(cors());

    this.app.set('views', __dirname + '/views');
    this.app.set('view engine', 'jsx');
    this.app.engine('jsx', reactViews.createEngine());

    const router = express.Router();

    router.get('/.well-known/openid-configuration', handler.discoveryHandler);
    router.get('/token', (req, res) => res.send({ hello: "world!" }));
    router.get('/jwks', (req, res) => res.send({ hello: "world!" }));
    router.get('/userinfo', (req, res) => res.send({ hello: "world!" }));
    router.get('/auth', handler.authorizationHandler);
    router.get('/auth/:provider', handler.providerHandler);
    router.get('/auth/:provider/callback', handler.providerCallbackHandler);
    router.get('/approval', (req, res) => res.send({ hello: "world!" }));
    router.get('/healthz', (req, res) => res.send({ hello: "world!" }));

    this.app.use('/', router);
  }

  get = () => {
    return this.app;
  }
}

export default App;