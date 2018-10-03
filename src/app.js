import express from 'express';
import * as http from 'http';
import debug from 'debug';
import * as api from './api';
import * as settings from './settings';
import * as wwhook from './wwhook';
import * as websocket from './websocket';

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

if (require.main === module) {
  main(process.env, (err) => {
    if (err) {
      console.log('Error starting app:', err);
      return;
    }
    log('App started');
  });
}
