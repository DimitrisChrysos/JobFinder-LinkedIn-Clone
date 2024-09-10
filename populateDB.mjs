import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import User from './models/user.mjs';
import connectMongoDB from './lib/mongodb.mjs';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import Post from './models/post.mjs';
import Listing from './models/listing.mjs';
dotenv.config();

// Select numUsers random users from the database
const selectRandomUsers = async (numUsers) => {
    const users = await User.find({admin: false});
    const randomUsers = [];
    for (let i = 0; i < numUsers; i++) {
        const randomIndex = Math.floor(Math.random() * users.length);
        randomUsers.push(users[randomIndex]);
    }
    return randomUsers;
};

// Select numPosts random posts from the database
const selectRandomPosts = async (numPosts) => {
    const posts = await Post.find();
    const randomPosts = [];
    for (let i = 0; i < numPosts; i++) {
        const randomIndex = Math.floor(Math.random() * posts.length);
        randomPosts.push(posts[randomIndex]);
    }
    return randomPosts;
};

const skillPool = [
    'JavaScript', 'React', 'Node.js', 'Python', 'HTML/CSS', 'Project Management', 'UI/UX Design',
    'Data Analysis', 'Machine Learning', 'Cloud Computing', 'DevOps', 'Agile Methodologies',
    'Team Leadership', 'Customer Service', 'Marketing Strategies', 'Public Speaking',
    'Search Engine Optimization (SEO)', 'Copywriting', 'Networking', 'Social Media Marketing',
    'Content Management Systems (CMS)', 'Graphic Design', 'Video Editing', 'Photography',
    'Mobile App Development', 'Web Development', 'Database Management', 'Cybersecurity',
    'Artificial Intelligence', 'Blockchain', 'E-commerce', 'Sales', 'Financial Analysis',
    'Accounting', 'Human Resources', 'Recruitment', 'Legal', 'Healthcare', 'Education',
    'Hard-Working', 'Problem-Solving', 'Creative', 'Adaptable', 'Detail-Oriented', 'Organized',
    'Team Player', 'Self-Motivated', 'Fast Learner', 'Time Management', 'Communication Skills',
    'Leadership', 'Collaboration', 'Critical Thinking', 'Decision Making', 'Negotiation',
    'Team-Work', 'Conflict Resolution', 'Empathy', 'Patience', 'Stress Management', 'Resilience',
    'Self-Confidence', 'Open-Mindedness', 'Innovation', 'Curiosity', 'Integrity', 'Ethics',
];

// Custom function to generate realistic skill names
const generateSkills = (numSkills) => {
    const shuffledSkills = skillPool.sort(() => 0.5 - Math.random());
    const selectedSkills = shuffledSkills.slice(0, numSkills);
    return selectedSkills.join(', ');
};

// Generate random user
const generateRandomUser = (hashedPassword, userPosts, userListings, userSkills) => {

    return {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        password: hashedPassword,
        path: '/assets/logo_images/default-avatar-icon.jpg',
        post_counter: userPosts,
        listing_counter: userListings,
        job_position: faker.person.jobTitle(),
        employment_agency: faker.company.name(),
        experience: faker.lorem.sentence(),
        education: faker.lorem.sentence(),
        skills: generateSkills(userSkills),
        connections: [],
        connectionRequests: [],
        interactedWithPosts: [],
        publicInfo: [],
        chats: [],
        lastChatId: "",
        likedPosts: [],
        commentedPosts: [],
        notifications: []
    };
};

// Generate random posts
const generateRandomPosts = async (user, numPosts) => {
    for (let i = 0; i < numPosts; i++) {
        const post = {
            userId: user._id,
            text: faker.lorem.sentence(),
            path: "no-file",
            views: Math.floor(Math.random() * 1000) + 1,
        }
        const newPost = await Post.create(post);
        console.log(`Post ${newPost._id} inserted successfully`);
    }
}

// Generate random listings
const generateRandomListings = async (user, numListings) => {
    for (let i = 0; i < numListings; i++) {
        const listing = {
            userId: user._id,
            job_pos: faker.person.jobTitle(),
            description: generateSkills(10),
            path: "no-file",
            views: Math.floor(Math.random() * 1000) + 1,
        }
        const newListing = await Listing.create(listing);
        console.log(`Listing ${newListing._id} inserted successfully`);
    }
}

// Make random connections
const makeRandomConnections = async (user, numConnections) => {
    const randomUsers = await selectRandomUsers(numConnections);
    for (const randomUser of randomUsers) {
        await User.updateOne({ _id : randomUser._id}, {
            $push: { connections: user._id.toString() }
        })
        await User.updateOne({ _id : user._id}, {
            $push: { connections: randomUser._id.toString() }
        })
        console.log(`User ${user.name} ${user.surname} connected with ${randomUser.name} ${randomUser.surname}`);
    }
}

// Like random posts
const likeRandomPosts = async (user, numLikes) => {
    const randomPosts = await selectRandomPosts(numLikes);
    const userId = user._id.toString();
    for (const randomPost of randomPosts) {
        const randomPostId = randomPost._id.toString();        

        // Add a like to the post
        await Post.updateOne({ _id : randomPostId}, {
            $push: { like: userId }
        })

        // Add the post to the like array of the user
        await User.updateOne({ _id : userId}, {
            $push : { likedPosts: randomPostId }
        })

        // Add the post to the user's interactedWithPosts array if an interaction doesn't already exist
        if (!user.interactedWithPosts.includes(randomPostId)) {
            await User.updateOne({ _id : userId}, {
                $push: { interactedWithPosts: randomPostId }
            })
        }

        // Add a notification to the user who posted the post,
        // if the post creator is not the one who liked the post
        if (randomPost.userId !== userId) {
            await User.updateOne({ _id : randomPost.userId}, {
                $push: { notifications: { description: " liked your ", userId: userId, postId: randomPostId} }
            })
        }

        console.log(`User ${user.name} ${user.surname} liked post ${randomPostId} from user ${randomPost.userId}`);
    }
}

// Comment random posts
const commentRandomPosts = async (user, numComments) => {
    const randomPosts = await selectRandomPosts(numComments);
    const userId = user._id.toString();
    for (const randomPost of randomPosts) {
        const randomPostId = randomPost._id.toString(); 
    
        // Add a comment to the post
        await Post.updateOne({ _id : randomPostId }, {
            $push: { comment: { description: faker.lorem.sentence(), userId: userId } }
        });

        // Add the post to the comment array of the user
        await User.updateOne({ _id : userId}, {
            $push : { commentedPosts: randomPostId }
        })

        // Add the post to the user's interactedWithPosts array if an interaction doesn't already exist
        if (!user.interactedWithPosts.includes(randomPostId)) {
            const updateUser = await User.updateOne({ _id : userId}, {
                $push: { interactedWithPosts: randomPostId }
            })
        }

        // Add a notification to the user who posted the post,
        // only if the post creator is not the one who commented on the post
        if (randomPost.userId !== userId) {
            const updatePostUser = await User.updateOne({ _id : randomPost.userId}, {
                $push: { notifications: { description: " commented on your ", userId: userId, postId: randomPostId} }
            })
        }

        console.log(`User ${user.name} ${user.surname} commented on post ${randomPostId} from user ${randomPost.userId}`);
    }
}
            

const populateDB = async (numUsers) => {
    try {

        await connectMongoDB();

        // Hash the password "123"    
        const hashedPassword = await bcrypt.hash("123", 10);

        // Create numUsers users
        for (let i = 0 ; i < numUsers; i++) {

            const userSkills = Math.floor(Math.random() * 10) + 1; // Set the random number of skills (1-10)
            const userPosts = Math.floor(Math.random() * 4) + 1; // Set the random number of posts (1-4)
            const userListings = Math.floor(Math.random() * 4) + 1; // Set the random number of listings (1-4)
            const userConnections = Math.floor(Math.random() * 4) + 1; // Set the random number of connections (1-4)
            const userLikes = Math.floor(Math.random() * 10) + 1; // Set the random number of likes (1-10)
            const userComments = Math.floor(Math.random() * 10) + 1; // Set the random number of comments (1-10)

            // Generate a random user
            const user = generateRandomUser(hashedPassword, userPosts, userListings, userSkills);
            const newUser = await User.create(user); // Save the user to the database
            console.log(`User ${newUser.name} ${newUser.surname} inserted successfully`);

            // Create the user's posts
            const postsPromise = generateRandomPosts(newUser, userPosts);

            // Create the user's listings
            const listingsPromise = generateRandomListings(newUser, userListings);

            const promises = [postsPromise, listingsPromise];

            // Make the user connect with random users, like random posts, and comment on random posts
            // Only if the user is not one of the first 15 users
            if (i >= 15) {
                // Make the user connect with random users
                const connectionsPromise = makeRandomConnections(newUser, userConnections);
    
                // Make the user like random posts
                const likesPromise = likeRandomPosts(newUser, userLikes);
    
                // Make the user comment on random posts
                const commentsPromise = commentRandomPosts(newUser, userComments);
            
                promises.push(connectionsPromise, likesPromise, commentsPromise);
            }
        }

        // Wait for all promises to complete
        await Promise.all(promises);
        
        console.log(`${numUsers} Users inserted successfully`);

        // Close the connection
        mongoose.connection.close();
    } catch (error) {
        console.log("An error occurred while populating the database: ", error);
    }
};

// Populate the database with 1 user
populateDB(20)
