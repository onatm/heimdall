import '@babel/polyfill';
import http from 'http';
import App from './app';
import Store from './store';
import Handler from './handlers';

const port = process.env.PORT || '5666';
const issuer = "http://localhost:5666";
const responseTypes = ["code", "id_token"];
const clients = [{ id: 'heimdall-sample-app', redirectURI: "http://localhost:3000/callback" }];
const providers = [{ id: "github", name: "GitHub" }];

responseTypes.sort();

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