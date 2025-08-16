import http from 'http';

const server = http.createServer((_req, res) => {
  res.end('Hello from Clinic!');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
