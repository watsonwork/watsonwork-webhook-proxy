import * as auth from './auth';
import * as queue from './queue';

import debug from 'debug';

const log = debug('watsonwork-webhook-proxy-app');

const WebSocket = require('ws');
const connections = {};

const push = (appId) => {
  if (connections[appId]) {
    log('Pushing to ' + appId);
    let event = queue.getNext(appId);
    if (event !== null) {
      log('  event ' + event.id);
      connections[appId].send(JSON.stringify(event));
    }
  } else {
    log('No connection with ' + appId);
  }
};

export const init = (server) => {
  const wss = new WebSocket.Server({ server: server, verifyClient: auth.websocket });
  queue.addListener(push);
  wss.on('connection', (ws, req) => {
    ws.appId = req.appId;
    log('Connection from ' + ws.appId);
    connections[ws.appId] = ws;
    push(ws.appId);

    ws.on('message', (data) => {
      let message = JSON.parse(data);
      if (message) {
        if (message.type === 'event_ack') {
          if (message.id) {
            log('Event ' + ws.appId + '/' + message.id + ' accepted');
            queue.remove(ws.appId, message.id);
            push(ws.appId);
          }
        }
      }
    });

    ws.on('close', () => {
      log('Closed connection from ' + ws.appId);
      delete connections[ws.appId];
    });
  });
};
