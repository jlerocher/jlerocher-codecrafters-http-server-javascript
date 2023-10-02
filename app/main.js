const net = require("net");
const fs = require("fs");
const p = require("path");

/**
 * Handles incoming data from the socket and sends appropriate HTTP responses.
 * 
 * @param {net.Socket} socket - The socket object representing the connection.
 */
const handleData = (socket) => {
  socket.on('data', (chunk) => {
    const data = Buffer.from(chunk).toString('utf8');
    const lines = data.split("\r\n");
    const [method, path, protocol] = lines[0].split(" ");

    if (path === '/') {
      // Send a 200 OK response for the root path
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith('/echo')) {
      // Extract the random string from the path and send it as the response
      const randomString = path.slice(6);
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:${randomString.length}\r\n\r\n${randomString}\r\n`);
    } else if (path.startsWith('/user-agent')) {
      // Extract the User-Agent header value from the request and send it as the response
      const headers = lines.slice(1);
      const userAgentHeader = headers.find((h) => h.startsWith('User-Agent'));
      const userAgentValue = userAgentHeader.slice(12);
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:${userAgentValue.length}\r\n\r\n${userAgentValue}\r\n`);
    } else if (path.startsWith('/files')) {
      // Handle requests for files
      const filename = path.slice(7);
      const dirname = process.argv.at(-1);
      const fullpath = p.join(dirname, filename);

      if (method === 'GET') {
        // Handle GET requests for files
        if (fs.existsSync(fullpath)) {
          const file = fs.readFileSync(fullpath);
          const fileSize = fs.statSync(fullpath).size;
          socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileSize}\r\n\r\n${file}`);
        } else {
          // Send a 404 Not Found response if the file does not exist
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
      } else {
        // Handle other HTTP methods for files (e.g., POST)
        const content = lines.at(-1);
        fs.writeFileSync(fullpath, content);
        socket.write("HTTP/1.1 201 Created\r\n\r\n");
      }
    } else {
      // Send a 404 Not Found response for unknown paths
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
};

const server = net.createServer(handleData);

/**
 * Starts the HTTP server and listens on the specified port and host.
 */
const startServer = () => {
  server.listen(4221, "localhost");
};

startServer();
