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

const getUserPosts = async (userId) => {
    try {
        const url = new URL(`/api/post?id=${userId}`, baseUrl);
        const res = await fetch(url.toString(), { agent });
        if (!res.ok) {
            throw new Error('Failed to fetch user posts');
        }
        const data = await res.json();
        const posts = data.posts;
        return posts;
    } catch (error) {
        console.log("An error occurred while fetching user posts:", error);
        throw error;
    }
};

const getLikesAndComments = async (user, post) => {
    try {
        let likesCounter = 0;
        let commentsCounter = 0;
        const postCreatorPosts = await getUserPosts(post.userId);
        for (const post of postCreatorPosts) {
            const userLiked = post.like.includes(user._id);
            if (userLiked) {
                likesCounter++;
            }

            const userComments = post.comment.filter(comment => comment.userId.toString() === user._id.toString());
            commentsCounter += userComments.length;
        }
        return { likesCounter, commentsCounter };
    } catch (error) {
        console.log("An error occurred while getting the likes:", error);
        throw error;
    }
};

const areConnected = async (user, post) => {
    try {
        const url = new URL(`/api/connections/are-connected`, baseUrl);
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id1: user._id,
                id2: post.userId
            }),
            agent: agent
        });
        if (!res.ok) {
            throw new Error('Failed to check if users are connected');
        }

        const data = await res.json();
        if (data.message === "connection exists")
            return true;
        else if (data.message === "connection does not exist")
            return false;
    } catch (error) {
        console.log("An error occurred while checking if users are connected:", error);
        throw error;
    }
};

const getTimePoints = async (post) => {
    try {
        const now = new Date();
        const postDate = new Date(post.createdAt);
        const timeDifference = now - postDate; // Difference in milliseconds

        let points = 0;

        const oneHour = 60 * 60 * 1000; // milliseconds in an hour
        const oneDay = 24 * oneHour; // milliseconds in a day
        const oneWeek = 7 * oneDay; // milliseconds in a week

        if (timeDifference <= oneHour) {
            points = 1; // Highest points for posts created within the last hour
        } else if (timeDifference <= oneDay) {
            points = 0.5; // Points for posts created within the last day
        } else if (timeDifference <= oneWeek) {
            points = 0.2; // Points for posts created within the last week
        } else {
            points = 0.1; // Least points for posts created more than a week ago
        }

        return points;
    } catch (error) {
        console.log("An error occurred while calculating time points:", error);
        throw error;
    }
};

const getViews = async (postId) => {
    try {
        const url = new URL(`/api/post/views?postId=${postId}`, baseUrl);
        const res = await fetch(url.toString(), { agent });
        if (!res.ok) {
            throw new Error('Failed to fetch views');
        }
        const data = await res.json();
        return data.views;
    } catch (error) {
        console.log("An error occurred while getting the views:", error);
        throw error;
    }
}

const userHasNoLikesAndComments = async (userId) => {
    try {
        const url = new URL(`/api/post/user-has-no-likes-and-comments?userId=${userId}`, baseUrl);
        const res = await fetch(url.toString(), { agent });
        if (!res.ok) {
            throw new Error('Failed to check if user has no likes and comments');
        }
        const data = await res.json();
        return data.hasNoLikesComments;
    } catch (error) {
        console.log("An error occurred while checking if user has no likes and comments:", error);
        throw error;        
    }

}

const createMatrixR = async (n, m, users, posts) => {

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

            const hasNoLikesComments = await userHasNoLikesAndComments(user._id);
            for (let j = 1 ; j <= m ; j++) {
                const post = posts[j - 1];

                // Get if the user is connected with the creator of the post
                const usersConnected = await areConnected(user, post);
                
                if (hasNoLikesComments) {
                    // Get the views of the post and add them to the matrix
                    const views = await getViews(post._id);
                    if (usersConnected) {
                        matrix[i][j] = 2*views;
                    } else {
                        matrix[i][j] = views;
                    }
                } else {
                    // Get how many likes and comments a user has given to the creator of the post
                    const { likesCounter: likes, commentsCounter: comments } = await getLikesAndComments(user, post);
                    
                    // Check how resently the post was created
                    const timePoints = await getTimePoints(post);
    
                    // Fill the matrix with the ratings
                    if (usersConnected) {
                        if (likes + comments >= 1) {
                            matrix[i][j] = 5*(likes + comments);
                        } else {
                            matrix[i][j] = 5;
                        }
                    }
                    matrix[i][j] += likes + comments + timePoints;
                    // console.log("post:", post.text, "\tuser:", user.name, "\trating", matrix[i][j], "\ti:", i, "\tj:", j);
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
const matrixFactorization = async (R, P, Q, K, alpha, beta, steps) => {
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

const getFactorizedMatrix = async (R, newP, newQ, users, posts) => {
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
        // Get the users and posts
        const [users, posts] = await Promise.all([getUsers(), getPosts()]);

        // Get the table dimensions
        const n = users.length;
        const m = posts.length;

        // Create the R table with users and posts
        const rTable = await createMatrixR(n, m, users, posts);
        console.log("rTable: ", rTable);
        
        // Extract the actual ratings matrix without headers for matrix factorization
        const R = rTable.slice(1).map(row => row.slice(1));

        // TODO: try different values for K until the best one is found
        const K = 2; // Set the number of latent features K
        const alpha = 0.0002; // Set the learning rate alpha
        const beta = 0.002; // Set the regularization parameter beta
        const steps = 1000; // Set the number of iterations

        // Create the P(n*K) and Q(K*m) matrices
        const pTable = Array(n).fill().map(() => Array(K).fill().map(() => Math.random()));
        const qTable = Array(K).fill().map(() => Array(m).fill().map(() => Math.random()));

        // Perform matrix factorization on the R table
        const { P: newP, Q: newQ } = await matrixFactorization(R, pTable, qTable, K, alpha, beta, steps);
        
        const R_hat = await getFactorizedMatrix(R, newP, newQ, users, posts);
        console.log("R_hat: ", R_hat);
        
        // Post the matrix to the database
        const matrix = R_hat;
        const data = await postMatrix(matrix);
    } catch (error) {
        console.log("An error occurred while starting matrix factorization:", error);
        throw error;
    }
};

// Function to run MatrixFactorization every 30 minutes
async function runMatrixFactorizationPostsPeriodically() {
    
    console.log("Running the Matrix Factorization, this process repeats every 30 minutes\n")
    await startMatrixFactorization(); // Run immediately on start
    setInterval(async () => {
        await startMatrixFactorization();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
}

module.exports = {
    runMatrixFactorizationPostsPeriodically
};