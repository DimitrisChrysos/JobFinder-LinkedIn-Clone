// matrixFactorizationListingWorker.js
const { parentPort } = require('worker_threads');
const { matrixFactorization, createMatrixR, getFactorizedMatrix, postMatrix, deleteOldMatrix } = require('./matrixFactorizationListings.jsx');

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

    // // DELETE THIS LATER:
    // const matrixJson = JSON.stringify(matrix);
    // const matrixSizeInBytes = Buffer.byteLength(matrixJson, 'utf8');
    // const matrixSizeInMB = matrixSizeInBytes / (1024 * 1024);
    // if (matrixSizeInMB > 16) {
    //   throw new Error('Matrix is too large to post to mongoDB');
    // }
    // //////////////////////////////////////////

    const splitMatrix = (matrix, rowsPerChunk) => {
      const chunks = [];
      for (let i = 0; i < matrix.length; i += rowsPerChunk) {
        const chunk = matrix.slice(i, i + rowsPerChunk).map(row => row.slice());
        chunks.push(chunk);
      }
      return chunks;
    };

    // Define the chunk size
    const CHUNK_SIZE = 1000000;

    const matrixJson = JSON.stringify(matrix);
    const matrixSizeInBytes = Buffer.byteLength(matrixJson, 'utf8');
    const matrixSizeInMB = matrixSizeInBytes / (1024 * 1024);
    console.log("matrixSizeInMB: ", matrixSizeInMB);

    // Check the size of row[0] of the matrix
    const rowZeroJson = JSON.stringify(matrix[0]);
    const rowZeroSizeInBytes = Buffer.byteLength(rowZeroJson, 'utf8');
    const rowZeroSizeInMB = rowZeroSizeInBytes / (1024 * 1024);
    console.log("rowZeroSizeInMB: ", rowZeroSizeInMB);

    // Total rows of the matrix
    const rows = matrix.length;

    // Get the number of rows per chunk
    const rowsPerChunk = Math.floor(CHUNK_SIZE / rowZeroSizeInBytes);

    // Split the matrix into chunks
    const matrixChunks = splitMatrix(matrix, rowsPerChunk);

    // Get the chunks needed to post the matrix
    const chunksNeeded = Math.ceil(rows / rowsPerChunk);

    console.log("rows: ", rows, "rowsPerChunk: ", rowsPerChunk, "matrixChunksCounter: ", matrixChunks.length, "chunksNeeded: ", chunksNeeded);

    // Post each chunk to the database
    await deleteOldMatrix();
    for (const chunk of matrixChunks) {

      // Check If the chunk is too large to post to mongoDB
      const chunkJson = JSON.stringify(chunk);
      const chunkSizeInBytes = Buffer.byteLength(chunkJson, 'utf8');
      const chunkSizeInMB = chunkSizeInBytes / (1024 * 1024);
      console.log("chunkSizeInMB: ", chunkSizeInMB);
      if (chunkSizeInMB > 16) {
        throw new Error('Chunk is too large to post to mongoDB');
      }

      await postMatrix(chunk);
    }

    parentPort.postMessage({ success: true });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});