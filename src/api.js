// const querystring = require ('querystring');
const debug = require ('debug').debug;
const express = require ('express');
const bparser = require('body-parser');
const auth = require('./auth');
const settings = require('./settings');
const queue = require('./queue');

const log = debug('watsonwork-webhook-proxy-manage');

const register = (req, res) => {
  if (req.body.secret) {
    log('Registering ' + req.params.appId);
    settings.setSecret(req.params.appId, req.body.secret);
    res.status(201).end();
  }
  else {
    res.status(400).end();
  }
};

const remove = (req, res) => {
  log('Removing ' + req.params.appId);
  settings.remove(req.params.appId);
  res.status(200).end();
};

const getAll = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(queue.getAll(req.appId));
  queue.clear(req.appId);
  res.end();
};

const getRouter = () => {
  let router = express.Router();
  router.use(auth.requireAppId);
  router.use(auth.auth);
  router.use(bparser.json({ type: '*/*' }));
  router.put('/:appId', register);
  router.delete('/:appId', remove);
  router.get('/:appId', getAll);
  return router;
};

exports.getRouter = getRouter;
