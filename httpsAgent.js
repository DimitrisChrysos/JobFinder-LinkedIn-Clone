const fs = require('fs');
const path = require('path');
const https = require('https');

// Create an HTTPS Agent with the self-signed certificate
const caCert = fs.readFileSync(path.join(__dirname, 'certificates', 'cert.pem'));
const agent = new https.Agent({
  ca: caCert,
  rejectUnauthorized: false // Disable SSL certificate validation
});

module.exports = agent;