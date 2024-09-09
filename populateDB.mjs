import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import User from './models/user.mjs';
import connectMongoDB from './lib/mongodb.mjs';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import Post from './models/post.mjs';
import Listing from './models/listing.mjs';
dotenv.config();

// To add more complex users in the database
// we can first add 5 users that depend on random already existing users (excluding admin)
// then add 10 more users that depend on random users from the 10 existings users (excluding admin)
// then add 20 more users that depend on random users from the 20 existings users (excluding admin)
// and so on until we reach 1000 users...


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
        }
        const newListing = await Listing.create(listing);
        console.log(`Listing ${newListing._id} inserted successfully`);
    }
}

            

const populateDB = async (numUsers) => {
    try {

        await connectMongoDB();

        // Hash the password "123"    
        const hashedPassword = await bcrypt.hash("123", 10);

        // Get the number of users in the database
        // const startUsersLength = await User.countDocuments({admin: false});

        // const users = [];
        for (let i = 0 ; i < numUsers; i++) {

            // Select 5 random users from the database
            const randomUsers = await selectRandomUsers(5);

            const userSkills = Math.floor(Math.random() * 10) + 1; // Set the random number of skills (1-10)
            const userPosts = Math.floor(Math.random() * 4) + 1; // Set the random number of posts (1-4)
            const userListings = Math.floor(Math.random() * 4) + 1; // Set the random number of listings (1-4)
            const userConnections = Math.floor(Math.random() * 4) + 1; // Set the random number of connections (1-4)
            const userLikes = Math.floor(Math.random() * 10) + 1; // Set the random number of likes (1-10)
            const userComments = Math.floor(Math.random() * 10) + 1; // Set the random number of comments (1-10)

            // Generate a random user
            const user = generateRandomUser(hashedPassword, userPosts, userListings, userSkills);

            // users.push(user);

            const newUser = await User.create(user); // Save the user to the database
            console.log(`User ${newUser.name} ${newUser.surname} inserted successfully`);

            // Create the users posts
            await generateRandomPosts(newUser, userPosts);

            // Create the users listings
            await generateRandomListings(newUser, userListings);
        }



        // while (users.length <= numUsers) {
        //     const randomUsers = await selectRandomUsers(5);
        //     for (let i = 0; i < startUsersLength; i++) {
        //         const user = generateRandomUser(hashedPassword);
        //         // user.connections = [randomUsers[i]._id];



        //         users.push(user);
        //     }
        // }

        // Insert users into the database
        // await User.insertMany(users);
        // console.log(`${numUsers} Users inserted successfully`);




        // Close the connection
        mongoose.connection.close();
    } catch (error) {
        console.log("An error occurred while populating the database: ", error);
    }
};

// CAUTION!!!: 
// The database needs at least 5 users and 10 posts to work properly
populateDB(1) // Populate the database with 5 users
