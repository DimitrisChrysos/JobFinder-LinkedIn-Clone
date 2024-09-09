import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import User from './models/user.mjs';
import connectMongoDB from './lib/mongodb.mjs';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
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

// Generate random user
const generateRandomUser = (hashedPassword) => {



    return {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        password: hashedPassword, //faker.internet.password(),
        path: '/assets/logo_images/default-avatar-icon.jpg',
        post_counter: 0, //faker.datatype.number(),
        listing_counter: 0, //faker.datatype.number(),
        job_position: faker.person.jobTitle(),
        employment_agency: faker.company.name(),
        experience: faker.lorem.sentence(),
        education: faker.lorem.sentence(),
        skills: faker.lorem.words(5),
        // connections: [],
        // connectionRequests: [],
        // interactedWithPosts: [],
        // publicInfo: [],
        // chats: [],
        // lastChatId: "",
        // likedPosts: [],
        // commentedPosts: [],
        // notifications: []
    };
};

const populateDB = async (numUsers) => {
    try {

        await connectMongoDB();

        const hashedPassword = await bcrypt.hash("123", 10); // Hash the password "123"

        const users = [];
        for (let i = 0 ; i < numUsers; i++) {
            const user = generateRandomUser(hashedPassword);
            users.push(user);
        }

        // Insert users into the database
        await User.insertMany(users);
        console.log(`${numUsers} Users inserted successfully`);

        // Close the connection
        mongoose.connection.close();
    } catch (error) {
        console.log("An error occurred while populating the database: ", error);
    }
};

// Populate the database with 5 users
populateDB(1)
