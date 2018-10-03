const WebSocket = require('ws');

let token = process.argv[2];
let url = process.argv[3];

const ws = new WebSocket(url, [], {
  headers: { Authorization: 'Bearer ' + token }
});

ws.on('message', (data) => {
  let message = JSON.parse(data);
  console.log(message);
  if (message.type === 'event') {
    // accept the event
    ws.send(JSON.stringify({
      type: 'event_ack',
      id: message.id
    }));
  }
});
