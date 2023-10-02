const net = require("net");
const fs = require("fs");
1
const p = require("path")
const server = net.createServer((socket) => {
  socket.on('data', (chunk) => {
    const data = Buffer.from(chunk).toString('utf8');
    const lines = data.split("\r\n");
    const [method, path, protocol] = lines[0].split(" ");
    if (path === '/') {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith('/echo')) {
      const randomString = path.slice(6);
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:${randomString.length}\r\n\r\n${randomString}\r\n`);
    } else if (path.startsWith('/user-agent')) {
        const headers = lines.slice(1);
        const userAgentHeader = headers.find((h) => h.startsWith('User-Agent'));
        const userAgentValue = userAgentHeader.slice(12);
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:${userAgentValue.length}\r\n\r\n${userAgentValue}\r\n`);
    } else if (path.startsWith('/files')) {
        const filename = path.slice(7);
        const dirname = process.argv.at(-1);
        const fullpath = p.join(dirname, filename)
        if (fs.existsSync(fullpath)) {
          const file = fs.readFileSync(fullpath);
          const fileSize = fs.statSync(fullpath).size;
          socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileSize}\r\n\r\n${file}`);
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
  1
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
      socket.end();
    });
    socket.on("close", () => {
      socket.end();
      server.close();
    });
  });
  server.listen(4221, "localhost");