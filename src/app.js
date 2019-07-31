import express from 'express';

class App {
  constructor({ handler, port } = opts) {
    this.app = express();
    this.app.set('port', port);

    const router = express.Router();

    router.get('/.well-known/openid-configuration', handler.discoveryHandler);
    router.get('/token', (req, res) => res.send({ hello: "world!" }));
    router.get('/jwks', (req, res) => res.send({ hello: "world!" }));
    router.get('/userinfo', (req, res) => res.send({ hello: "world!" }));
    router.get('/auth', (req, res) => res.send({ hello: "world!" }));
    router.get('/auth/:upstream', (req, res) => res.send({ hello: "world!" }));
    router.get('/auth/callback', (req, res) => res.send({ hello: "world!" }));
    router.get('/auth/callback/:upstream', (req, res) => res.send({ hello: "world!" }));
    router.get('/approval', (req, res) => res.send({ hello: "world!" }));
    router.get('/healthz', (req, res) => res.send({ hello: "world!" }));

    this.app.use('/', router);
  }

  get() {
    return this.app;
  }
}

export default App;