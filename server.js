const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const next = require('next');
const { runMatrixFactorizationPeriodically } = require('./utils/matrixFactorization.jsx');
const { runMatrixFactorizationListingsPeriodically } = require('./utils/matrixFactorizationListings.jsx');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname,  
        "certificates", "key.pem")), 
    cert: fs.readFileSync(path.join(__dirname, 
        "certificates", "cert.pem")), 
};

app.prepare().then(() => {
  const server = express();
  
  server.all('*', (req, res) => {
    return handle(req, res);
  });
  
  https.createServer(httpsOptions, server).listen(3000, err => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
    
    // Run the managePostsPeriodically function every 30 minutes
    runMatrixFactorizationPeriodically();

    // Run the manageListingsPeriodically function every 30 minutes
    runMatrixFactorizationListingsPeriodically();
  });
});