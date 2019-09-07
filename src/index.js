import '@babel/polyfill';
import http from 'http';
import fs from 'fs';

import commandLineArgs from 'command-line-args';
import mongoose from 'mongoose';
import { JWKS } from '@panva/jose';

import App from './app';
import Store from './store';
import Handler from './handlers';
import AccountManager from './account/manager';
import createConfig from './config';

const optionDefinitions = [
  { name: 'config', alias: 'c', type: String },
];

const options = commandLineArgs(optionDefinitions);

const port = process.env.PORT || '5666';

const {
  issuer, mongoURI, sessionKeys, expiry, providers, clients,
} = createConfig(fs.readFileSync(options.config, 'utf8'));

const keystore = new JWKS.KeyStore();
keystore.generateSync('RSA', 2048, { use: 'sig' });

mongoose.connect(mongoURI, { useNewUrlParser: true, useFindAndModify: false }, (err) => {
  if (err) {
    throw err;
  }
});

const store = new Store({ keystore, providers, clients });
const accountManager = new AccountManager(store);
const handler = new Handler({ issuer, expiry }, store, accountManager);
const { app } = new App({ handler, port, sessionKeys });

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
