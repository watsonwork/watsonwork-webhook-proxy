const debug = require('debug');
const storage = require('./storage');
const log = debug('watsonwork-webhook-proxy-settings');
let apps = {};

exports.load = (cb) => {
  storage.init((err, id) => {
    cb(err);
  });
  storage.read('apps.json', (err, data) => {
    if (err) log('Can not read apps config: %o', err);
    else {
      log('Loaded apps');
      apps = data;
    }
  });
};

const save = () => {
  storage.write(apps, 'apps.json', (err) => {
    if (err) log('Can not save apps: %o', err);
  });
};

exports.getSecret = (appId) => apps[appId];

exports.setSecret = (appId, secret) => {
  apps[appId] = secret;
  save();
};

exports.remove = (appId) => {
  delete apps[appId];
  save();
};


