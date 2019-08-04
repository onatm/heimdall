import '@babel/polyfill';
import http from 'http';
// import { JWK, JWKS } from '@panva/jose';
import App from './app';
import Store from './store';
import Handler from './handlers';

const port = process.env.PORT || '5666';
const issuer = "http://localhost:5666";
const responseTypes = ["code", "id_token"];
const clients = [
  {
    id: 'heimdall-sample-app',
    redirectURI: "http://localhost:3000/callback"
  }];
const providers = [
  {
    type: "github",
    id: "github",
    name: "GitHub",
    config: {
      clientId: "",
      clientSecret: "",
      redirectURI: "http://localhost:5556/auth/callback"
    }
  }
];

responseTypes.sort();

// const privateKey = JWK.generateSync('RSA', 2048, { use: 'sig' }, true);
// console.log(privateKey.toJWK(true));
// console.log(privateKey.toJWK(false));

// const keystore = new JWKS.KeyStore();
// Promise.all([
//   keystore.generate('RSA', 2048, {
//     use: 'sig',
//   }),
//   keystore.generate('RSA', 2048, {
//     use: 'enc',
//   }),
//   keystore.generate('EC', 'P-256', {
//     use: 'sig',
//   }),
//   keystore.generate('EC', 'P-256', {
//     use: 'enc',
//   }),
//   keystore.generate('OKP', 'Ed25519', {
//     use: 'sig',
//   }),
// ]).then(function () {
//   console.log('this is the full private JWKS:\n', keystore.toJWKS(false));
// });

const store = new Store({ clients, providers });
const handler = new Handler({ issuer, responseTypes }, store);
const app = new App({ handler, port }).get();

const server = http.createServer(app);
server.listen(port);

server.on('listening', () => {
  var addr = server.address();
  // log.info(`Listening on port ${addr.port}!`);
});

server.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      log.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});