const wwapi = require('./wwapi');
const debug = require('debug');

const log = debug('watsonwork-webhook-proxy-auth');

const setAppId = (req) => {
  let parts = req.url.split(/\//);
  let appId = parts[parts.length - 1];
  req.appId = appId;
  log('appId=' + appId);
};

exports.requireAppId = (req, res, next) => {
  setAppId(req);
  if (!req.appId) {
    res.status(400).send();
    return;
  }
  next();
};

exports.authenticate = (req, next) => {
  let token = null;
  if (req.headers && req.headers.authorization) {
    let parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  if (token === null) {
    return next(false);
  }
  return wwapi.getId(token, (err, id) => {
    log(id);
    if (err) {
      log(err);
      return next(false);
    }
    if (req.appId === id) {
      return next(true);
    }    
    return next(false);
    
  });
};

exports.websocket = (info, next) => {
  setAppId(info.req);
  if (info.req.appId) {
    exports.authenticate(info.req, next);
  }
  else {
    next(false);
  }
};

exports.auth = (req, res, next) => {
  exports.authenticate(req, (result) => {
    if (result) next();
    else {
      res.status(401).send();
    }
  });
};

