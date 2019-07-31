import express from 'express';
import reactViews from 'express-react-views';

class App {
  constructor({ handler, port } = opts) {
    this.app = express();
    this.app.set('port', port);

    this.app.set('views', __dirname + '/views');
    this.app.set('view engine', 'jsx');
    this.app.engine('jsx', reactViews.createEngine());

    const router = express.Router();

    router.get('/.well-known/openid-configuration', handler.discoveryHandler);
    router.get('/token', (req, res) => res.send({ hello: "world!" }));
    router.get('/jwks', (req, res) => res.send({ hello: "world!" }));
    router.get('/userinfo', (req, res) => res.send({ hello: "world!" }));
    router.get('/auth', handler.authorizationHandler);
    router.get('/auth/:upstream', (req, res) => res.send({ hello: "world!" }));
    router.get('/auth/callback', (req, res) => res.send({ hello: "world!" }));
    router.get('/auth/callback/:upstream', (req, res) => res.send({ hello: "world!" }));
    router.get('/approval', (req, res) => res.send({ hello: "world!" }));
    router.get('/healthz', (req, res) => res.send({ hello: "world!" }));

    this.app.use('/', router);
  }

  get = () => {
    return this.app;
  }
}

export default App;