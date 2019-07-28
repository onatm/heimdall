import '@babel/polyfill';
import http from 'http';
import app from './src/app.js';

const port = process.env.PORT || '3000';

app.set('port', port);

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