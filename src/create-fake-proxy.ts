import http from 'http';
import httpProxy from 'http-proxy';
import url from 'url';
import net from 'net';

const PROXY_PORT = '0.0.0.0:8888';

// Create a createFakeProxy server with custom application logic
const createFakeProxy = httpProxy.createProxyServer({});

// Create an HTTP server that acts as a createFakeProxy
const server = http.createServer((req: http.IncomingMessage, res) => {
  console.log('PROXY -> server ~ req.url: ', req.url);

  let parsedUrl: any = '';
  if (req.url != null) {
    parsedUrl = url.parse(req.url);
  }
  const target = `${parsedUrl.protocol}//${parsedUrl.host}`;

  console.log(`Proxy request to: ${target} - ${req.url}`);

  // Options for the createFakeProxy
  const proxyOptions = {
    target: target,
    changeOrigin: true,
    secure: false, // Accept self-signed certificates
  };

  // Proxy the request
  createFakeProxy.web(req, res, proxyOptions, (error: any) => {
    if (error) {
      console.error(`Proxy error: ${error.message}`);
      res.writeHead(502); // Bad Gateway
      res.end('Bad Gateway');
    }
  });
});

// Handle HTTPS CONNECT requests
server.on('connect', (req, clientSocket, head) => {
  const { port, hostname } = new URL(`http://${req.url}`);

  const serverSocket = net.connect(Number(port) || 443, hostname, () => {
    clientSocket.write(
      'HTTP/1.1 200 Connection Established\r\n' + 'Proxy-agent: Node.js-Proxy\r\n' + '\r\n'
    );
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', (err) => {
    console.error('Server socket error:', err);
    clientSocket.end();
  });

  clientSocket.on('error', (err) => {
    console.error('Client socket error:', err);
    serverSocket.end();
  });
});

// Listen on port 3000
const PORT = PROXY_PORT;
server.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});

// Handle createFakeProxy errors
createFakeProxy.on('error', (err: any, req: any, res: any) => {
  console.error(`Proxy server error: ${err.message}`);
  res.writeHead(502, {
    'Content-Type': 'text/plain',
  });
  res.end('Something went wrong. And we are reporting a custom error message.');
});
