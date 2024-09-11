const { Worker } = require('worker_threads');
const fetch = require('node-fetch');
const agent = require('../httpsAgent'); // Import the HTTPS agent

const baseUrl = 'https://localhost:3000'; // Base URL of the API

const getUsers = async () => {
    try {
        const url = new URL('/api/profile', baseUrl);
        const res = await fetch(url.toString(), { agent });
        if (!res.ok) {
            throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        const users = data.users;
        const filteredUsers = users.filter(user => !user.admin); // remove the admin users
        return filteredUsers;
    } catch (error) {
        console.log("An error occurred while fetching users:", error);
        throw error;
    }
};

const getListings = async () => {
    try {
        const url = new URL('/api/listing/get-all-listings', baseUrl);
        const res = await fetch(url.toString(), { agent });
        if (!res.ok) {
            throw new Error('Failed to fetch listings');
        }
        const data = await res.json();
        const listings = data.listings;
        return listings;
    } catch (error) {
        console.log("An error occurred while fetching listings:", error);
        throw error;
    }
};

const getViews = (listing) => {
    return listing.views;
}

const areConnected = (user, listing) => {
    try {
        if (user.connections.includes(listing.userId))
            return true;
        else
            return false;

    } catch (error) {
        console.log("An error occurred while checking if users are connected:", error);
        throw error;
    }
};

const createMatrixR = (n, m, users, listings) => {

    try {
        // Create a matrix with n rows and m columns
        const matrix = Array(n+1).fill().map(() => Array(m+1).fill(0));
    
        // Fill the first row with listings IDs
        for (let j = 1; j <= m; j++) {
            matrix[0][j] = listings[j - 1]._id;
        }

        // Fill the first column with user IDs
        for (let i = 1; i <= n; i++) {
            matrix[i][0] = users[i - 1]._id;
        }

        // Fill the table with the ratings
        for (let i = 1 ; i <= n ; i++) {
            const user = users[i - 1];

            for (let j = 1 ; j <= m ; j++) {
                const listing = listings[j - 1];

                // Get if the user is connected with the creator of the listing
                const usersConnected = areConnected(user, listing);

                // Get the views of the listing and add them to the matrix
                const views = getViews(listing);

                if (usersConnected) {
                    if (views === 0)
                        matrix[i][j] = 1;
                    else
                        matrix[i][j] = 2*(views/100);
                } else {
                    matrix[i][j] = (views/100);
                }
            }
        }

        return matrix;
    } catch (error) {
        console.log("An error occurred while creating matrix R:", error);
        throw error;
    }
};

// Matrix Factorization
const matrixFactorization = (R, P, Q, K, alpha, beta, steps) => {
    try {
        // TODO: fill in the code for matrix factorization
        for (let step = 0; step < steps; step++) {
            for (let i = 0; i < R.length; i++) {
                for (let j = 0; j < R[i].length; j++) {
                    if (R[i][j] > 0) {
                        let eij = R[i][j] - P[i].reduce((acc, val, idx) => acc + val * Q[idx][j], 0);
                        for (let k = 0; k < K; k++) {
                            P[i][k] = P[i][k] + alpha * (2 * eij * Q[k][j] - beta * P[i][k]);
                            Q[k][j] = Q[k][j] + alpha * (2 * eij * P[i][k] - beta * Q[k][j]);
                        }
                    }
                }
            }
            
            let e = 0;
            for (let i = 0; i < R.length; i++) {
                for (let j = 0; j < R[i].length; j++) {
                    if (R[i][j] > 0) {
                        e += Math.pow(R[i][j] - P[i].reduce((acc, val, idx) => acc + val * Q[idx][j], 0), 2);
                        for (let k = 0; k < K; k++) {
                            e += (beta / 2) * (Math.pow(P[i][k], 2) + Math.pow(Q[k][j], 2));
                        }
                    }
                }
            }
            if (e < 0.001) {
                break;
            }
        }
        return { P, Q };

    } catch (error) {
        console.log("An error occurred while performing matrix factorization:", error);
        throw error;
    }
};

// Delete the old matrix
const deleteOldMatrix = async () => {
    try {
        const url = new URL('/api/matrix-factorization-listings/remove-all-chunks', baseUrl);
        const res = await fetch(url.toString(), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            agent: agent
        });
        if (!res.ok) {
            throw new Error('Failed to delete the old matrix');
        }
    } catch (error) {
        console.log("An error occurred while deleting the old matrix:", error);
        throw error;
    }
}

const getFactorizedMatrix = (R, newP, newQ, users, listings) => {
    const R_hat = Array(R.length + 1).fill(0).map(() => Array(newQ[0].length + 1).fill(0));
    
    // Fill the first row with listing IDs
    for (let j = 1; j <= newQ[0].length; j++) {
        R_hat[0][j] = listings[j - 1]._id;
    }
    
    // Fill the first column with user IDs
    for (let i = 1; i <= newP.length; i++) {
        R_hat[i][0] = users[i - 1]._id;
    }
    
    // Fill the matrix with the calculated values
    for (let i = 1; i <= newP.length; i++) {
        for (let j = 1; j <= newQ[0].length; j++) {
            R_hat[i][j] = newP[i - 1].reduce((acc, val, idx) => acc + val * newQ[idx][j - 1], 0);
        }
    }

    return R_hat;
};

// Post the matrix to the databse
const postMatrix = async (matrix) => {
    try {
        const url = new URL('/api/matrix-factorization-listings/save-array', baseUrl);
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                matrix
            }),
            agent: agent
        });
        if (!res.ok) {
            throw new Error('Failed to post the matrix');
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log("An error occurred while posting the matrix:", error);
        throw error;
    }
};

// Start matrix factorization
const startMatrixFactorization = async () => {
    try {
        // Get the users and listings
        const [users, listings] = await Promise.all([getUsers(), getListings()]);

        // // Get the table dimensions
        // const n = users.length;
        // const m = listings.length;

        // // Create the R table with users and listings
        // const rTable = createMatrixR(n, m, users, listings);

        // // // Extract the actual ratings matrix without headers for matrix factorization
        // const R = rTable.slice(1).map(row => row.slice(1));

        // // TODO: try different values for K until the best one is found
        // const K = 2; // Set the number of latent features K
        // const alpha = 0.0002; // Set the learning rate alpha
        // const beta = 0.002; // Set the regularization parameter beta
        // const steps = 1000; // Set the number of iterations

        // // Create the P(n*K) and Q(K*m) matrices
        // const pTable = Array(n).fill().map(() => Array(K).fill().map(() => Math.random()));
        // const qTable = Array(K).fill().map(() => Array(m).fill().map(() => Math.random()));

        // // Perform matrix factorization on the R table
        // const { P: newP, Q: newQ } = await matrixFactorization(R, pTable, qTable, K, alpha, beta, steps);
        
        // const R_hat = getFactorizedMatrix(R, newP, newQ, users, listings);
        
        // // Post the matrix to the database
        // const matrix = R_hat;
        // postMatrix(matrix).then(data => {
        //     console.log('Matrix factorization completed:', data);
        // }).catch(error => {
        //     console.error('Error during matrix factorization:', error);
        // });

        const worker = new Worker('./utils/matrixFactorizationListingWorker.js');
        worker.postMessage({ users, listings });

        worker.on('message', (message) => {
            if (message.success) {
                console.log('Matrix factorization completed');
            } else {
                console.error('Error during matrix factorization:', message.error);
            }
        });

        worker.on('error', (error) => {
            console.error('Worker error:', error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });
    } catch (error) {
        console.log("An error occurred while starting matrix factorization:", error);
        throw error;
    }
};



// Function to run MatrixFactorization every 30 minutes
async function runMatrixFactorizationListingsPeriodically() {
    
    console.log("Running the Matrix Factorization for listings, this process repeats every 30 minutes\n")
    startMatrixFactorization(); // Run immediately on start
    setInterval(async () => {
        startMatrixFactorization();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
}

module.exports = {
    runMatrixFactorizationListingsPeriodically,
    matrixFactorization,
    createMatrixR,
    getFactorizedMatrix,
    postMatrix,
    deleteOldMatrix
};