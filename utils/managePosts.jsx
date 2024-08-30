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
                    matrix[i][j] = 1;
                }
                matrix[i][j] += likes + comments + timePoints;
                console.log("post: ", post._id, "user: ", user.name, "rating: ", matrix[i][j], "i: ", i, "j: ", j);
            }
        }

        return matrix;
    } catch (error) {
        console.log("An error occurred while creating matrix R:", error);
        throw error;
    }
};

export async function managePosts(posts) {

    // Matrix Factorization

    try {
        // Get the users and posts
        const users = await getUsers();
        const posts = await getPosts();

        // Create the R table with users and posts
        const rTable = await createMatrixR(users.length, posts.length, users, posts);
        console.log("rTable: ", rTable);


    } catch (error) {
        console.log("An error occurred while managing posts:", error);
        throw error;
    }
}