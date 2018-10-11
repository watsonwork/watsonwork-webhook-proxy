let queue = {};

const QUEUE_MAX = 100;

let listener = null;
exports.addListener = (cb) => {
  listener = cb;
};

exports.getNext = (appId) => {
  if (!queue[appId]) return null;
  let keys = Object.keys(queue[appId]);
  if (keys.length === 0) return null;
  let key = keys[0];
  return { type: 'event', id: key, data: queue[appId][key] };
};

exports.remove = (appId, key) => {
  if (!queue[appId]) return null;
  return delete queue[appId][key];
};

exports.put = (appId, key, data) => {
  if (!queue[appId]) queue[appId] = {};
  queue[appId][key] = data;
  let keys = Object.keys(queue[appId]);
  if (keys.length > QUEUE_MAX) remove(appId, keys[0]);
  if (listener) listener(appId);
};

exports.getAll = (appId) => {
  return queue[appId] ? queue[appId] : {};
};

exports.clear = (appId) => {
  queue[appId] = {};
};

