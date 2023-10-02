const net = require("net");
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
        server.close();
    });
    socket.on("data", data => {
        const lines = data.toString().split("\r\n")
        const [method, path, protocol] = lines[0].split(" ")
        let section = 0;
        const headers = lines.filter((v, i) => i >= 2 && v != "").map(l => l.split(": "))
        console.log("method", method)
        console.log("path", path)
        console.log("protocol", protocol)
        console.log("headers", headers)
        if(path == "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
        } else if(path.startsWith("/echo/")) {
            const garbage = path.replace(/^\/echo\//g, "")
            
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${new Blob([garbage]).size}\r\n\r\n${garbage}`)
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
1
        }
1
        socket.end();
    })
});
server.listen(4221, "localhost");