const bparser = require('body-parser');
const createHmac = require('crypto').createHmac;
const express = require('express');
const settings = require('./settings');
const auth = require('./auth');
const queue = require('./queue');
const debug = require('debug');

const router = express.Router();
exports.router = router;

const log = debug('watsonwork-webhook-proxy-wwhook');

const verify = (req, res, buf, encoding) => {
  let wsecret = settings.getSecret(req.appId);
  if (req.get('X-OUTBOUND-TOKEN') !==
        createHmac('sha256', wsecret).update(buf).digest('hex')) {
    log('Invalid request signature');
    const err = new Error('Invalid request signature');
    err.status = 401;
    throw err;
  }
};

// Handle Watson Work Webhook challenge requests
const challenge = (req, res, next) => {
  let wsecret = settings.getSecret(req.appId);
  if (req.body.type === 'verification') {
    log('Got Webhook verification challenge %o', req.body);
    const body = JSON.stringify({
      response: req.body.challenge
    });
    res.set('X-OUTBOUND-TOKEN', createHmac('sha256', wsecret).update(body).digest('hex'));
    res.type('json').send(body);
    return;
  }
  next();
};

exports.process = (req, res) => {
  queue.put(req.appId, req.get('X-OUTBOUND-INDEX'), req.body);
  res.status(201).end();
};

router.use(auth.requireAppId);
router.use(bparser.json({ type: '*/*', verify: verify }));
router.use(challenge);
router.use(exports.process);

