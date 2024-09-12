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

const getPosts = async () => {
    try {
        const url = new URL('/api/post/get-all-posts', baseUrl);
        const res = await fetch(url.toString(), { agent });
        if (!res.ok) {
            throw new Error('Failed to fetch posts');
        }
        const data = await res.json();
        const posts = data.posts;
        return posts;
    } catch (error) {
        console.log("An error occurred while fetching posts:", error);
        throw error;
    }
};

// Get the number of likes and comments a user has given to the creator of a post
const getLikesAndComments = (user, post) => {
    try {
        let likesCounter = 0;
        let commentsCounter = 0;
        const likedPosts = user.likedPosts;
        for (const likedPost of likedPosts) {
            if (likedPost.userId === post.userId) {
                likesCounter++;
            }
        }

        const commentedPosts = user.commentedPosts;
        for (const commentedPost of commentedPosts) {
            if (commentedPost.userId === post.userId) {
                commentsCounter++;
            }
        }

        return { likesCounter, commentsCounter };
    } catch (error) {
        console.log("An error occurred while getting the likes:", error);
        throw error;
    }
};

// Check if the user and the creator of the post are connected
const areConnected = (user, post) => {
    try {
        if (user.connections.includes(post.userId))
            return true;
        else
            return false;
    } catch (error) {
        console.log("An error occurred while checking if users are connected:", error);
        throw error;
    }
};

// Get the views of a post
const getViews = (post) => {
    return post.views;
}

// Check if the user has no likes and comments
const userHasNoLikesAndComments = (user) => {
    try {
        if (user.likedPosts.length + user.commentedPosts.length === 0)
            return true;
        else
            return false;
    } catch (error) {
        console.log("An error occurred while checking if user has no likes and comments:", error);
        throw error;        
    }
}

// Create the starting matrix R
const createMatrixR = (n, m, users, posts) => {

    try {
        // Create a matrix with n rows and m columns
        const matrix = Array(n+1).fill().map(() => Array(m+1).fill(0));
    
        // Fill the first row with post IDs
        for (let j = 1; j <= m; j++) {
            matrix[0][j] = posts[j - 1]._id;
        }

        // Fill the first column with user IDs
        for (let i = 1; i <= n; i++) {
            matrix[i][0] = users[i - 1]._id;
        }

        // Fill the table with the ratings
        for (let i = 1 ; i <= n ; i++) {
            const user = users[i - 1];

            const hasNoLikesComments = userHasNoLikesAndComments(user);
            for (let j = 1 ; j <= m ; j++) {
                const post = posts[j - 1];

                // Get if the user is connected with the creator of the post
                const usersConnected = areConnected(user, post);
                
                if (hasNoLikesComments) {
                    // Get the views of the post and add them to the matrix
                    const views = getViews(post);
                    if (usersConnected) {
                        matrix[i][j] = 5*(views/100);
                    } else {
                        matrix[i][j] = (views/100);
                    }
                } else {
                    // Get how many likes and comments a user has given to the creator of the post
                    const { likesCounter: likes, commentsCounter: comments } = getLikesAndComments(user, post);
    
                    // Fill the matrix with the ratings
                    if (usersConnected) {
                        if (likes + comments >= 1) {
                            matrix[i][j] = 25*(likes + comments);
                        }
                        else {
                            matrix[i][j] = 5;
                        }
                    }
                    matrix[i][j] += 5*(likes + comments);
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

// Post the matrix to the databse
const postMatrix = async (matrix) => {
    try {
        const url = new URL('/api/matrix-factorization-posts/save-array', baseUrl);
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

// Delete the old matrix
const deleteOldMatrix = async () => {
    try {
        const url = new URL('/api/matrix-factorization-posts/remove-all-chunks', baseUrl);
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

// Get the factorized matrix from the factorized P and Q matrices
const getFactorizedMatrix = (R, newP, newQ, users, posts) => {
    const R_hat = Array(R.length + 1).fill(0).map(() => Array(newQ[0].length + 1).fill(0));
    
    // Fill the first row with post IDs
    for (let j = 1; j <= newQ[0].length; j++) {
        R_hat[0][j] = posts[j - 1]._id;
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

// Start matrix factorization
const startMatrixFactorization = async () => {
    try {
        const [users, posts] = await Promise.all([getUsers(), getPosts()]);

        const worker = new Worker('./utils/matrixFactorizationPostWorker.js');
        worker.postMessage({ users, posts });

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
async function runMatrixFactorizationPostsPeriodically() {
    
    console.log("Running the Matrix Factorization, this process repeats every 30 minutes\n")
    startMatrixFactorization(); // Run immediately on start
    setInterval(async () => {
        startMatrixFactorization();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
}

module.exports = {
    runMatrixFactorizationPostsPeriodically,
    matrixFactorization,
    createMatrixR,
    getFactorizedMatrix,
    postMatrix,
    deleteOldMatrix
};