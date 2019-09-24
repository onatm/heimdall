import '@babel/polyfill';
import http from 'http';
import fs from 'fs';

import commandLineArgs from 'command-line-args';
import mongoose from 'mongoose';
import { JWKS } from '@panva/jose';

import App from './app';
import Store from './store';
import AccountManager from './account/manager';
import createConfig from './config';

const optionDefinitions = [
  { name: 'config', alias: 'c', type: String },
];

const options = commandLineArgs(optionDefinitions);

const port = process.env.PORT || '5666';

const {
  issuer, mongoURI, sessionKeys, providers, clients, expiry,
} = createConfig(fs.readFileSync(options.config, 'utf8'));

const keystore = new JWKS.KeyStore();
keystore.generateSync('RSA', 2048, { use: 'sig' });

mongoose.connect(mongoURI, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false }, (err) => {
  if (err) {
    throw err;
  }
});

const store = new Store();
const manager = new AccountManager(store);
const { app } = new App({
  issuer, keystore, clients, providers, store, manager, expiry, port, sessionKeys,
});

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
