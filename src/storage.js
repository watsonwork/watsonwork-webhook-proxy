const pkgcloud = require('pkgcloud');
const vcap = require('vcap_services');

exports.CONTAINER = 'hooksy';
let client;

const auth = (cb) =>
  client.auth((err) => cb(err, client._identity));

exports.init = (cb) => {
  let creds = vcap.getCredentials('Object-Storage');
  let config = {
    provider: 'openstack',
    useServiceCatalog: true,
    useInternal: false,
    keystoneAuthVersion: 'v3'
  };
  Object.assign(config, creds);
  config.tennantId = config.projectId;
  config.authUrl = config.auth_url;

  client = pkgcloud.storage.createClient(config);
  auth(cb);
};

exports.write = (obj, file, cb) => {
  let upload = client.upload({
    container: exports.CONTAINER,
    remote: file
  });

  upload.on('error', (err) => cb(err));
  upload.on('success', (file) => cb(null));
  upload.write(JSON.stringify(obj));
  upload.end();
};

exports.read = (file, cb) => {
  let download = client.download({
    container: exports.CONTAINER,
    remote: file
  });
  let buf = '';
  download.on('error', (err) => cb(err));
  download.on('data', (data) => buf += data);
  download.on('end', () => {
    try {
      cb(null, JSON.parse(buf));
    }
    catch (e) {
      cb(e);
    }
  });
};

