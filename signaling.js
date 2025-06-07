// Simple client to send messages to a WebSocket server
const WebSocket = require('ws');
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node ws_testing.js <server_url>');
  process.exit(1);
}

const options = {
    headers: {
      'Authorization': 'MCToken ' + args[0],
    }
  };

const serverUrl = 'https://signal.franchise.minecraft-services.net/ws/v1.0/signaling/' + args[0];
const ws = new WebSocket(serverUrl, options);

// Just loop wait for command line input and then send it to the server and also receive messages from the server
ws.on('open', function open() {
  console.log('Connected to server:', serverUrl);
  process.stdin.on('data', function(data) {
    const message = data.toString().trim();
    if (message) {
      ws.send(message);
      console.log('Sent:', message);
    }
  });
});

// Add this to see incoming messages!
ws.on('message', function incoming(data) {
    console.log('Received:', data.toString()); // Convert Buffer to string
  });
  
// Add error handling
ws.on('error', function error(err) {
console.error('WebSocket Error:', err.message);
});
  
// Add close handling
ws.on('close', function close(code, reason) {
  console.log(`WebSocket closed: Code ${code}, Reason: ${reason ? reason.toString() : 'No reason'}`);
});