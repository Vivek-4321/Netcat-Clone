# 🌐 Netcat-like Tool Documentation

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Server Mode](#server-mode)
4. [Client Mode](#client-mode)
5. [Port Scanning](#port-scanning)
6. [Additional Features](#additional-features)
7. [Sample Commands](#sample-commands)
8. [Troubleshooting](#troubleshooting)

## 🎉 Introduction

This Netcat-like tool is a versatile networking utility implemented in Node.js. It provides functionality for TCP and UDP connections, port scanning, and file transfers, with additional features like hex dumping and verbose output.

## 🛠️ Installation

1. Ensure you have Node.js installed on your system.
2. Clone the repository or download the `netcat.js` and `netcat-client.js` files.
3. Open a terminal and navigate to the directory containing the scripts.

## 🖥️ Server Mode

The server mode allows you to listen for incoming connections on a specified port.

### Usage

```
node netcat.js [-l] [-u] [-p port] [-e command] [-x] [-v] [-o output_file] [host]
```

### Options

- `-l`: Listen mode (required for server)
- `-u`: Use UDP instead of TCP
- `-p port`: Specify the port to listen on
- `-e command`: Execute the specified command on incoming connections
- `-x`: Enable hex dump output
- `-v`: Verbose mode
- `-o output_file`: Save received data to the specified file

## 📱 Client Mode

The client mode allows you to connect to a server or send data to a specific host and port.

### Usage

```
node netcat-client.js [-u] [-z] [-x] [-v] [-i input_file] [-o output_file] [port] [host]
```

### Options

- `-u`: Use UDP instead of TCP
- `-z`: Port scanning mode
- `-x`: Enable hex dump output
- `-v`: Verbose mode
- `-i input_file`: Send data from the specified file
- `-o output_file`: Save received data to the specified file

## 🔍 Port Scanning

Port scanning allows you to check which ports are open on a target host.

### Usage

```
node netcat-client.js -z [start_port[-end_port]] [host]
```

## 🚀 Additional Features

1. **Hex Dump**: Use the `-x` option to display data in hexadecimal format.
2. **Verbose Mode**: Use the `-v` option for more detailed output.
3. **File Transfer**: Use `-i` (input) and `-o` (output) options to send and receive files.
4. **Command Execution**: Use `-e` in server mode to execute commands on incoming connections.

## 💻 Sample Commands

Here are some sample commands to help you get started:

1. 🎧 Start a TCP server on port 8080:

   ```
   node netcat.js -l -p 8080
   ```

2. 🔌 Connect to the TCP server:

   ```
   node netcat-client.js 8080 localhost
   ```

3. 📡 Start a UDP server on port 9090:

   ```
   node netcat.js -l -u -p 9090
   ```

4. 📤 Send data to the UDP server:

   ```
   node netcat-client.js -u 9090 localhost
   ```

5. 🔎 Scan ports 80-100 on example.com:

   ```
   node netcat-client.js -z 80-100 example.com
   ```

6. 📁 Send a file over TCP:

   ```
   node netcat-client.js -i file.txt 8080 localhost
   ```

7. 💾 Receive and save data to a file:

   ```
   node netcat.js -l -p 8080 -o received_data.txt
   ```

8. 🔢 Enable hex dump output for a TCP server:

   ```
   node netcat.js -l -p 8080 -x
   ```

9. 🗣️ Execute a command on incoming connections:

   ```
   node netcat.js -l -p 8080 -e "echo Hello, client!"
   ```

10. 🔊 Enable verbose mode for a UDP client:
    ```
    node netcat-client.js -u -v 9090 localhost
    ```

## ❗ Troubleshooting

1. 🚫 **Connection refused**: Ensure the server is running and the port is not in use by another application.
2. 🔒 **Permission denied**: You may need elevated privileges to bind to ports below 1024.
3. 🐌 **Slow connection**: Check your network connection or try using the `-v` option for more information.
4. 🚧 **Firewall issues**: Ensure your firewall is not blocking the connection.

If you encounter any other issues, please check the error message for more information or consult the Node.js documentation for network-related problems.

---

We hope you find this Netcat-like tool useful for your networking tasks! If you have any questions or need further assistance, please don't hesitate to ask. Happy networking! 🌐🚀
