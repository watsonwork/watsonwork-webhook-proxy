const express = require('express');
const http = require('http');
const debug = require('debug');
const api = require('./api');
const settings = require('./settings');
const wwhook = require('./wwhook');
const websocket = require('./websocket');

const log = debug('watsonwork-webhook-proxy-app');

const main = (env, cb) => {
  log('Creating app');

  settings.load((err) => {
    log('Can not load settings');
    log(err);
  });

  const app = express();
  app.use('/webhooks', api.getRouter());
  app.use('/hook', wwhook.router);
  const server = http.createServer(app);
  websocket.init(server);
  if (env.PORT) {
    log('HTTP server listening on port %d', env.PORT);
    server.listen(env.PORT, cb);
  }
};

main(process.env, (err) => {
  if (err) {
    console.log('Error starting app:', err);
    return;
  }
  log('App started');
});
