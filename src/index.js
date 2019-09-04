import '@babel/polyfill';
import http from 'http';

import mongoose from 'mongoose';
import { JWKS } from '@panva/jose';

import App from './app';
import Store from './store';
import Handler from './handlers';
import GithubProvider from './providers/github';

const port = process.env.PORT || '5666';
const issuer = 'http://localhost:5666';
const clients = [
  {
    id: 'heimdall-sample-app',
    redirectURI: 'http://localhost:3000/callback',
    audience: ['heimdall-sample-api'],
    scopes: ['read:messages'],
  }];
const providers = [
  {
    type: 'github',
    id: 'github',
    name: 'GitHub',
    config: {
      clientId: '',
      clientSecret: '',
    },
    internal: new GithubProvider({
      clientId: '',
      clientSecret: '',
      id: 'github',
      issuer,
    }),
  },
];
const mongoURI = 'mongodb://localhost:27018/heimdall';

const keystore = new JWKS.KeyStore();
keystore.generateSync('RSA', 2048, { use: 'sig' });

mongoose.connect(mongoURI, { useNewUrlParser: true, useFindAndModify: false }, (err) => {
  if (err) {
    throw err;
  }
});

const store = new Store({ keystore, clients, providers });
const handler = new Handler({ issuer }, store);
const { app } = new App({ handler, port });

const server = http.createServer(app);
server.listen(port);

server.on('listening', () => {
  // const addr = server.address();
  // log.info(`Listening on port ${addr.port}!`);
});

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case 'EACCES':
      // log.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // log.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
