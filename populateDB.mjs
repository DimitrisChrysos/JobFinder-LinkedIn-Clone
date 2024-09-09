import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import User from './models/user.mjs';
import connectMongoDB from './lib/mongodb.mjs';
import dotenv from 'dotenv';
dotenv.config();

// const mongoose = require('mongoose');
// const { faker } = require('@faker-js/faker');
// const User = require('./models/user.js');
// const connectMongoDB = require('./lib/mongodb.js');
// require('dotenv').config();


// To add more complex users in the database
// we can first add 5 users that depend on random already existing users (excluding admin)
// then add 10 more users that depend on random users from the 10 existings users (excluding admin)
// then add 20 more users that depend on random users from the 20 existings users (excluding admin)
// and so on until we reach 1000 users...


// Generate random user
const generateRandomUser = () => {
    return {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        password: "123", //faker.internet.password(),
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

        const users = [];
        for (let i = 0 ; i < numUsers; i++) {
            const user = generateRandomUser();
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
populateDB(5)
