const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

let appointments = [];
let notices = [
  { id: 1, message: 'Welcome to Hana ENT Hospital.' }
];
let results = [];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  if (method === 'GET' && parsedUrl.pathname === '/appointments') {
    return sendJson(res, 200, appointments);
  }
  if (method === 'POST' && parsedUrl.pathname === '/appointments') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const appt = { id: Date.now(), ...data };
        appointments.push(appt);
        sendJson(res, 201, appt);
      } catch (e) {
        sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }
  if (method === 'GET' && parsedUrl.pathname === '/notices') {
    return sendJson(res, 200, notices);
  }
  if (method === 'GET' && parsedUrl.pathname === '/results') {
    return sendJson(res, 200, results);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

http.createServer(handleRequest).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
