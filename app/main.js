const net = require("net");
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
function createResponse(status, headers, body) {
    let headerStr = ""
    for(const header in headers) {
        headerStr += header + ": " + headers[header] + "\r\n"
    }
    return `HTTP/1.1 ${status}\r\n${headerStr}Content-Length: ${new Blob([body]).size}\r\n\r\n${body}`;
}
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
        const headersRaw = lines.filter((v, i) => i >= 2 && v != "").map(l => l.split(": "))
        let headers = {}
        for(const header of headersRaw) {
            headers[header[0]] = header[1]
1
        }
        console.log("method", method)
        console.log("path", path)
        console.log("protocol", protocol)
        console.log("headers", headers)
        if(path == "/") {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
        } else if(path.startsWith("/echo/")) {
            const garbage = path.replace(/^\/echo\//g, "")
            socket.write(createResponse("200 OK", {
                "Content-Type": "text/plain"
            }, garbage))
        } else if(path.startsWith("/user-agent")) {
            socket.write(createResponse("200 OK", {
                "Content-Type": "text/plain"
            }, headers["User-Agent"]))
        } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
        }
        socket.end();
    })
});
server.listen(4221, "localhost");