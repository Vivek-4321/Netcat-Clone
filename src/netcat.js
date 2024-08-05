// const net = require('net');
// const { spawn } = require('child_process');

// const args = process.argv.slice(2);

// // Parse command line arguments
// let isListenMode = false;
// let isUDP = false;
// let isPortScan = false;
// let executeCommand = null;
// let hexDump = false;
// let host = 'localhost';
// let startPort = 0;
// let endPort = 0;

// for (let i = 0; i < args.length; i++) {
//   if (args[i] === '-l') {
//     isListenMode = true;
//   } else if (args[i] === '-p' && !isNaN(parseInt(args[i + 1]))) {
//     startPort = parseInt(args[i + 1]);
//     if (args[i + 1].includes('-')) {
//       const ports = args[i + 1].split('-');
//       startPort = parseInt(ports[0]);
//       endPort = parseInt(ports[1]);
//     }
//   } else if (args[i] === '-u') {
//     isUDP = true;
//   } else if (args[i] === '-z') {
//     isPortScan = true;
//   } else if (args[i] === '-e' && args[i + 1]) {
//     executeCommand = args[i + 1];
//   } else if (args[i] === '-x') {
//     hexDump = true;
//   } else if (!isNaN(parseInt(args[i])) && !startPort) {
//     startPort = parseInt(args[i]);
//   } else if (i === args.length - 1) {
//     host = args[i];
//   }
// }

// // Function to handle TCP connections
// function handleTCPConnection(socket) {
//   console.log(`Connection established from ${socket.remoteAddress}:${socket.remotePort}`);

//   socket.on('data', (data) => {
//     console.log(`Received ${data.length} bytes from the socket`);
//     if (hexDump) {
//       console.log(hexDumpData(data));
//     } else {
//       console.log(data.toString());
//     }

//     if (executeCommand) {
//       executeCommandHandler(socket, data.toString().trim());
//     }
//   });

//   socket.on('end', () => {
//     console.log('Client disconnected');
//   });

//   function executeCommandHandler(socket, command) {
//     const parts = command.split(' ');
//     const cmd = parts.shift();
//     const childProcess = spawn(cmd, parts);

//     childProcess.stdout.on('data', (data) => {
//       socket.write(data);
//     });

//     childProcess.stderr.on('data', (data) => {
//       socket.write(data);
//     });

//     childProcess.on('close', (code) => {
//       console.log(`Child process exited with code ${code}`);
//       socket.end();
//     });

//     socket.on('end', () => {
//       childProcess.kill();
//     });
//   }

//   function hexDumpData(data) {
//     // Implement hex dumping logic here
//     // This is a basic example, actual implementation may vary
//     return data.toString('hex').match(/../g).map((hex) => hex.toUpperCase()).join(' ');
//   }
// }

// // Start listening on the specified port
// if (isListenMode) {
//   if (isUDP) {
//     // Implement UDP server handling
//     console.log('UDP server mode is not yet implemented');
//   } else {
//     const server = net.createServer(handleTCPConnection);

//     server.listen(startPort, () => {
//       console.log(`ccnc listening on ${host}:${startPort}`);
//     });
//   }
// } else if (isPortScan) {
//   // Implement port scanning logic
//   console.log('Port scanning mode is not yet implemented');
// } else {
//   // Implement client mode logic
//   console.log('Client mode is not yet implemented');
// }


const net = require('net');
const dgram = require('dgram');
const { spawn } = require('child_process');
const fs = require('fs');

const args = process.argv.slice(2);

// Parse command line arguments
let isListenMode = false;
let isUDP = false;
let isPortScan = false;
let executeCommand = null;
let hexDump = false;
let host = 'localhost';
let startPort = 0;
let endPort = 0;
let verbose = false;
let outputFile = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-l') {
    isListenMode = true;
  } else if (args[i] === '-p' && !isNaN(parseInt(args[i + 1]))) {
    startPort = parseInt(args[i + 1]);
    if (args[i + 1].includes('-')) {
      const ports = args[i + 1].split('-');
      startPort = parseInt(ports[0]);
      endPort = parseInt(ports[1]);
    }
  } else if (args[i] === '-u') {
    isUDP = true;
  } else if (args[i] === '-z') {
    isPortScan = true;
  } else if (args[i] === '-e' && args[i + 1]) {
    executeCommand = args[i + 1];
  } else if (args[i] === '-x') {
    hexDump = true;
  } else if (args[i] === '-v') {
    verbose = true;
  } else if (args[i] === '-o' && args[i + 1]) {
    outputFile = args[i + 1];
  } else if (!isNaN(parseInt(args[i])) && !startPort) {
    startPort = parseInt(args[i]);
  } else if (i === args.length - 1) {
    host = args[i];
  }
}

// Function to handle TCP connections
function handleTCPConnection(socket) {
  console.log(`Connection established from ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', (data) => {
    console.log(`Received ${data.length} bytes from the socket`);
    if (hexDump) {
      console.log(hexDumpData(data));
    } else {
      console.log(data.toString());
    }

    if (outputFile) {
      fs.appendFileSync(outputFile, data);
    }

    if (executeCommand) {
      executeCommandHandler(socket, data.toString().trim());
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });
}

function executeCommandHandler(socket, command) {
  const parts = command.split(' ');
  const cmd = parts.shift();
  const childProcess = spawn(cmd, parts);

  childProcess.stdout.on('data', (data) => {
    socket.write(data);
  });

  childProcess.stderr.on('data', (data) => {
    socket.write(data);
  });

  childProcess.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    socket.end();
  });

  socket.on('end', () => {
    childProcess.kill();
  });
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

// Function to handle UDP connections
function handleUDPConnection(socket) {
  socket.on('message', (msg, rinfo) => {
    console.log(`Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`);
    if (hexDump) {
      console.log(hexDumpData(msg));
    } else {
      console.log(msg.toString());
    }

    if (outputFile) {
      fs.appendFileSync(outputFile, msg);
    }

    if (executeCommand) {
      const childProcess = spawn(executeCommand, [msg.toString().trim()]);
      childProcess.stdout.on('data', (data) => {
        socket.send(data, rinfo.port, rinfo.address);
      });
    }
  });
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
if (isListenMode) {
  if (isUDP) {
    const server = dgram.createSocket('udp4');
    server.bind(startPort, () => {
      console.log(`UDP server listening on ${host}:${startPort}`);
    });
    handleUDPConnection(server);
  } else {
    const server = net.createServer(handleTCPConnection);
    server.listen(startPort, () => {
      console.log(`TCP server listening on ${host}:${startPort}`);
    });
  }
} else if (isPortScan) {
  portScan(host, startPort, endPort || startPort);
} else {
  console.log('Client mode is handled by netcat-client.js');
}