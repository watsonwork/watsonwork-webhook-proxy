const request = require('request');
const debug = require('debug');

// Debug log
const log = debug('watsonwork-webhook-proxy-wwapi');

exports.graphql = (token, body, cb) => {
  request.post(
    'https://api.watsonwork.ibm.com/graphql', {
      headers: {
        'Content-Type': 'application/graphql',
        Authorization: 'Bearer ' + token
      },
      body: body
    }, (err, res) => {
      if (err || res.statusCode !== 200) {
        log('Error sending message %o, %o', body, err || res.statusCode);
        cb(err || res.statusCode);
        return;
      }
      try {
        cb(null, JSON.parse(res.body));
        return;
      }
      catch (e) {
        cb(e);
      }
      // log('Send result %d, %o', res.statusCode, res.body);
    });
};

exports.getId = (token, cb) => {
  exports.graphql(token, '{ me { id } }', (err, res) => {
    if (err) cb(err);
    else cb(null, res.data.me.id);
  });
};

