const net = require("net");

const handleRequest = (socket) => {
    return (data) => {
        const req = data.toString();
        const startLine = req.split("\r\n")[0];
        if (!startLine) {
          badRequest(socket);
        }
        const [_0, path, _1] = startLine.split(" ");
        if (!path) {
          badRequest(socket);
        }
        if (path === "/") {
            socket.write("HTTP/1.1 200 OK \r\n\r\n");
        } else if (path.startsWith("/echo")) {
            const randomString = path.slice(6);
            socket.write(
                `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length:${randomString.length}\r\n\r\n${randomString}\r\n`,
1
            );
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
        socket.end();
    };
};

function badRequest(socket) {

    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.end();
1
}


// Uncomment this to pass the first stage

const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
        server.close();
    });
    socket.on('data', handleRequest(socket));
});

server.listen(4221, "localhost");
