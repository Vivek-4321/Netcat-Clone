// const net = require('net');
// const readline = require('readline');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const args = process.argv.slice(2);

// // Parse command line arguments
// let isUDP = false;
// let isPortScan = false;
// let host = 'localhost';
// let startPort = 0;
// let endPort = 0;

// for (let i = 0; i < args.length; i++) {
//   if (args[i] === '-u') {
//     isUDP = true;
//   } else if (args[i] === '-z') {
//     isPortScan = true;
//   } else if (!isNaN(parseInt(args[i])) && !startPort) {
//     startPort = parseInt(args[i]);
//   } else if (i === args.length - 1) {
//     host = args[i];
//   }
// }

// // Function to handle TCP client
// function handleTCPClient(port) {
//   const client = net.connect({ host, port }, () => {
//     console.log(`Connected to ${host}:${port}`);
//     rl.prompt();
//   });

//   client.on('data', (data) => {
//     console.log(data.toString());
//     rl.prompt();
//   });

//   client.on('end', () => {
//     console.log('Disconnected from server');
//     rl.close();
//   });

//   rl.on('line', (input) => {
//     client.write(input);
//   });

//   client.on('error', (err) => {
//     console.error(`Error connecting to ${host}:${port}`, err);
//     rl.close();
//   });
// }

// // Start client mode logic
// if (isUDP) {
//   // Implement UDP client handling
//   console.log('UDP client mode is not yet implemented');
// } else if (isPortScan) {
//   // Implement port scanning client logic
//   console.log('Port scanning client mode is not yet implemented');
// } else {
//   // Default to TCP client mode
//   handleTCPClient(startPort);
// }


const net = require('net');
const dgram = require('dgram');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const args = process.argv.slice(2);

// Parse command line arguments
let isUDP = false;
let isPortScan = false;
let host = 'localhost';
let startPort = 0;
let endPort = 0;
let hexDump = false;
let verbose = false;
let inputFile = null;
let outputFile = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-u') {
    isUDP = true;
  } else if (args[i] === '-z') {
    isPortScan = true;
  } else if (args[i] === '-x') {
    hexDump = true;
  } else if (args[i] === '-v') {
    verbose = true;
  } else if (args[i] === '-i' && args[i + 1]) {
    inputFile = args[i + 1];
  } else if (args[i] === '-o' && args[i + 1]) {
    outputFile = args[i + 1];
  } else if (!isNaN(parseInt(args[i])) && !startPort) {
    startPort = parseInt(args[i]);
  } else if (i === args.length - 1) {
    host = args[i];
  }
}

function hexDumpData(data) {
  const hexChars = data.toString('hex').match(/.{1,2}/g) || [];
  const asciiChars = data.toString().replace(/[^\x20-\x7E]/g, '.');
  let output = '';

  for (let i = 0; i < hexChars.length; i += 16) {
    const hexLine = hexChars.slice(i, i + 16).join(' ').padEnd(48);
    const asciiLine = asciiChars.slice(i, i + 16).padEnd(16);
    output += `${i.toString(16).padStart(8, '0')}  ${hexLine}  |${asciiLine}|\n`;
  }

  return output;
}

// Function to handle TCP client
function handleTCPClient(port) {
  const client = net.connect({ host, port }, () => {
    console.log(`Connected to ${host}:${port}`);
    if (inputFile) {
      const fileStream = fs.createReadStream(inputFile);
      fileStream.pipe(client);
    } else {
      rl.prompt();
    }
  });

  client.on('data', (data) => {
    if (hexDump) {
      console.log(hexDumpData(data));
    } else {
      console.log(data.toString());
    }

    if (outputFile) {
      fs.appendFileSync(outputFile, data);
    }

    if (!inputFile) {
      rl.prompt();
    }
  });

  client.on('end', () => {
    console.log('Disconnected from server');
    rl.close();
  });

  if (!inputFile) {
    rl.on('line', (input) => {
      client.write(input);
    });
  }

  client.on('error', (err) => {
    console.error(`Error connecting to ${host}:${port}`, err);
    rl.close();
  });
}

// Function to handle UDP client
function handleUDPClient(port) {
  const client = dgram.createSocket('udp4');

  client.on('message', (msg, rinfo) => {
    if (hexDump) {
      console.log(hexDumpData(msg));
    } else {
      console.log(`Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`);
      console.log(msg.toString());
    }

    if (outputFile) {
      fs.appendFileSync(outputFile, msg);
    }

    if (!inputFile) {
      rl.prompt();
    }
  });

  if (inputFile) {
    fs.readFile(inputFile, (err, data) => {
      if (err) throw err;
      client.send(data, port, host, (err) => {
        if (err) throw err;
        console.log(`Sent ${data.length} bytes to ${host}:${port}`);
      });
    });
  } else {
    rl.on('line', (input) => {
      client.send(input, port, host, (err) => {
        if (err) throw err;
        console.log(`Sent ${input.length} bytes to ${host}:${port}`);
      });
    });
  }

  console.log(`UDP client ready to send to ${host}:${port}`);
  rl.prompt();
}

// Function to perform port scanning
function portScan(host, startPort, endPort) {
  console.log(`Scanning ports ${startPort} to ${endPort} on ${host}`);
  for (let port = startPort; port <= endPort; port++) {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.connect(port, host, () => {
      console.log(`Port ${port} is open`);
      socket.destroy();
    });
    socket.on('error', (err) => {
      if (verbose) {
        console.log(`Port ${port} is closed or filtered`);
      }
    });
    socket.on('timeout', () => {
      console.log(`Port ${port} timed out`);
      socket.destroy();
    });
  }
}

// Start the appropriate mode
if (isUDP) {
  handleUDPClient(startPort);
} else if (isPortScan) {
  portScan(host, startPort, endPort || startPort);
} else {
  handleTCPClient(startPort);
}