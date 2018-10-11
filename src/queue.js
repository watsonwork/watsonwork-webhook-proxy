let queue = {};

const QUEUE_MAX = 100;

let listener = null;
const addListener = (cb) => {
  listener = cb;
};

const getNext = (appId) => {
  if (!queue[appId]) return null;
  let keys = Object.keys(queue[appId]);
  if (keys.length === 0) return null;
  let key = keys[0];
  return { type: 'event', id: key, data: queue[appId][key] };
};

const remove = (appId, key) => {
  if (!queue[appId]) return null;
  return delete queue[appId][key];
};

const put = (appId, key, data) => {
  if (!queue[appId]) queue[appId] = {};
  queue[appId][key] = data;
  let keys = Object.keys(queue[appId]);
  if (keys.length > QUEUE_MAX) remove(appId, keys[0]);
  if (listener) listener(appId);
};

const getAll = (appId) => {
  return queue[appId] ? queue[appId] : {};
};

const clear = (appId) => {
  queue[appId] = {};
};

module.exports = addListener;
module.exports = getNext;
module.exports = remove;
module.exports = put;
module.exports = getAll;
module.exports = clear;
