// EDUCATIONAL USE ONLY (get it hehe ( ͡° ͜ʖ ͡°))

const passCodeMap = [
  {
    "0": "Book and Quill"
  },
  {
    "1": "Balloon"
  },
  {
    "2": "Rail"
  },
  {
    "3": "Alex"
  },
  {
    "4": "Cookie"
  },
  {
    "5": "Fish"
  },
  {
    "6": "Agent"
  },
  {
    "7": "Cake"
  },
  {
    "8": "Pickaxe"
  },
  {
    "9": "Water Bucket"
  },
  {
    "10": "Steve"
  },
  {
    "11": "Apple"
  },
  {
    "12": "Carrot"
  },
  {
    "13": "Panda"
  },
  {
    "14": "Sign"
  },
  {
    "15": "Potion"
  },
  {
    "16": "Map"
  },
  {
    "17": "Llama"
  }
]

let heartbeatInterval;

// For now we won't worry about authentication, and will just take a command line argument
// So first we need to get the command line argument
const args = process.argv.slice(2);
// Print usage if no argument is provided
if (args.length === 0) {
  console.log("Usage: node spoof.js <token>");
  process.exit(1);
}
// Get the token from the command line argument
const token = args[0];
const build = args[1] || "12110000"; // Default build if not provided
// Network ID is random 19 digits
const networkId = Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000;

const requestBody = {
    "accessToken": token,
    "build": build, 
    "locale": "en_US",
    "maxPlayers": 40,
    "networkId": networkId.toString(),
    "playerCount": 1,
    "protocolVersion": 1,
    "serverDetails": "BeeHive dev server",
    "serverName": "BeeHive",
    "transportType": 2
}

// Now we need to send a POST request to the server
let serverToken = "";
let passCode = "";

fetch('https://discovery.minecrafteduservices.com/host', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestBody)
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`ERRO! Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    // Save the response data to variables
    serverToken = data.serverToken;
    passCode = data.passcode;
    const readablePassCodeParts = passCode.split(',').map(code => {
      const index = parseInt(code, 10);
      if (passCodeMap[index] && passCodeMap[index][code]) {
          return passCodeMap[index][code];
      }
      return passCode; // Fallback to the original code if not found
    });
    const readablePassCode = readablePassCodeParts.join(', ');
    console.log(`Server join code: ${readablePassCode}`);
    console.log(`Netowork ID: ${networkId}`);
    console.log(`Starting heartbeat every 90 seconds...`);
    
    // Start heartbeat after successful server setup
    startHeartbeat();
  })
  .catch(error => {
    console.error(`There was a problem with your fetch operation:`, error);
    console.log(`Retrying in 5 seconds...`);
    setTimeout(() => {
      console.log(`Retrying server setup...`);
      process.exit(1);
    }, 5000);
  });

// Function to send heartbeat requests
function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    console.log(`Sending heartbeat...`);
    fetch('https://discovery.minecrafteduservices.com/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        build: build,
        locale: "en_US",
        passCode: passCode,
        protocolVersion: 1,
        serverToken: serverToken,
        transportType: 2
      })
    })
    .then(response => {
      if (!response.ok) {
        console.error(`Heartbeat failed: ${response.status} ${response.statusText}`);
      } else {
        console.log(`Heartbeat sent successfully at ${new Date().toLocaleTimeString()}`);
      }
      return response.json();
    })
    .then(data => {
      // Log heartbeat response if needed
      if (data && Object.keys(data).length > 0) {
        console.log(`Heartbeat response:`, data);
      }
    })
    .catch(error => {
      console.error(`Heartbeat error:`, error);
      console.log(`Will retry on next heartbeat cycle...`);
    });
  }, 90000); // 90 seconds
}

// Keep the program alive
console.log(`BeeHive server spoof started. Press Ctrl+C to stop.`);

// When the program is control-c, we need to clean up
process.on('SIGINT', () => {
  console.log("\nCleaning up...");
  if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      console.log("Heartbeat stopped.");
  }
  console.log("Sending dehost request...");
  fetch('https://discovery.minecrafteduservices.com/dehost', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          build: build,
          locale: "en_US",
          passCode: passCode,
          protocolVersion: 1,
          serverToken: serverToken
      })
  })
  .then(response => {
      if (!response.ok) {
          console.error(`Dehost failed: ${response.status} ${response.statusText}`);
      } else {
          console.log(`Server dehosted successfully.`);
      }
  })
  .catch(error => {
      console.error(`Dehost error:`, error);
  })
  .finally(() => {
      console.log("Exiting BeeHive server spoof.");
      process.exit(0);
  });
});