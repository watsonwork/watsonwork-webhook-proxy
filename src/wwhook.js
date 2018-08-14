import * as bparser from 'body-parser';
import { createHmac } from 'crypto';
import express from 'express';
import * as settings from './settings';
import * as auth from './auth';
import * as queue from './queue';

export const router = express.Router();

import debug from 'debug';

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


export const process = (req, res) => {
  queue.put(req.appId, req.get('X-OUTBOUND-INDEX'), req.body);
  res.status(201).end();
};

router.use(auth.requireAppId);
router.use(bparser.json({ type: '*/*' , verify: verify }));
router.use(challenge);
router.use(process);
