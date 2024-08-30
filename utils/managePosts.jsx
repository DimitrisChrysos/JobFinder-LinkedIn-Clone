import { getUserById } from "./getUserFromID";

const getUsers = async () => {
    try {
        const res = await fetch('/api/profile');
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
        const res = await fetch('/api/post/get-all-posts');
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
        const res = await fetch(`/api/post?id=${userId}`);
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
        const res = await fetch(`/api/connections/are-connected`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id1: user._id,
                id2: post.userId
            })
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

const createMatrixR = async (n, m, users, posts) => {

    try {
        // Create a matrix with n rows and m columns
        const matrix = Array(n).fill().map(() => Array(m).fill(0));
    
        // Fill the table with the ratings
        for (let i = 0 ; i < n ; i++) {
            for (let j = 0 ; j < m ; j++) {
                const user = users[i];
                const post = posts[j];
                
                // Get how many likes and comments a user has given to the creator of the post
                const { likesCounter: likes, commentsCounter: comments } = await getLikesAndComments(user, post);
     
                // Get if the user is connected with the creator of the post
                const usersConnected = await areConnected(user, post);
                
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
                // console.log("post: ", post._id, "user: ", user.name, "rating: ", matrix[i][j], "i: ", i, "j: ", j);
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
}

export async function managePosts(posts) {
    try {
        // Get the users and posts
        const users = await getUsers();
        const posts = await getPosts();

        // Get the table dimensions
        const n = users.length;
        const m = posts.length;

        // Create the R table with users and posts
        const rTable = await createMatrixR(n, m, users, posts);
        console.log("rTable: ", rTable);
        
        // TODO: try different values for K until the best one is found
        const K = 2; // Set the number of latent features K
        const alpha = 0.0002; // Set the learning rate alpha
        const beta = 0.002; // Set the regularization parameter beta
        const steps = 1000; // Set the number of iterations

        // Create the P(n*K) and Q(K*m) matrices
        const pTable = Array(n).fill().map(() => Array(K).fill().map(() => Math.random()));
        const qTable = Array(K).fill().map(() => Array(m).fill().map(() => Math.random()));
        console.log("pTable: ", pTable, "qTable: ", qTable);

        // Perform matrix factorization on the R table
        const { P: newP, Q: newQ } = await matrixFactorization(rTable, pTable, qTable, K, alpha, beta, steps);
        
        const R_hat = Array(rTable.length).fill(0).map(() => Array(newQ[0].length).fill(0));
        for (let i = 0; i < newP.length; i++) {
            for (let j = 0; j < newQ[0].length; j++) {
                R_hat[i][j] = newP[i].reduce((acc, val, idx) => acc + val * newQ[idx][j], 0);
            }
        }
        console.log("R_hat: ", R_hat);
        console.log("newP: ", newP, "newQ: ", newQ);

    } catch (error) {
        console.log("An error occurred while managing posts:", error);
        throw error;
    }
}