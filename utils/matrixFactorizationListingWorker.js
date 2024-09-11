// matrixFactorizationListingWorker.js
const { parentPort } = require('worker_threads');
const { matrixFactorization, createMatrixR, getFactorizedMatrix, postMatrix } = require('./matrixFactorizationListings.jsx');

parentPort.on('message', async ({ users, listings }) => {
    try {
    // Get the table dimensions
    const n = users.length;
    const m = listings.length;

    // Create the R table with users and listings
    const rTable = createMatrixR(n, m, users, listings);

    // Extract the actual ratings matrix without headers for matrix factorization
    const R = rTable.slice(1).map(row => row.slice(1));
    
    const K = 2; // Number of latent features
    const alpha = 0.0002; // Learning rate alpha
    const beta = 0.002; // Regularization parameter beta
    const steps = 1000; // Number of iterations

    // Create the P(n*K) and Q(K*m) matrices
    const pTable = Array(n).fill().map(() => Array(K).fill().map(() => Math.random()));
    const qTable = Array(K).fill().map(() => Array(m).fill().map(() => Math.random()));

    // Perform matrix factorization on the R table
    const { P: newP, Q: newQ } = matrixFactorization(R, pTable, qTable, K, alpha, beta, steps);
    const R_hat = getFactorizedMatrix(R, newP, newQ, users, listings);

    // Post the matrix to the database
    const matrix = R_hat;
    await postMatrix(matrix);

    parentPort.postMessage({ success: true });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});