import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import Post from '@/models/post';
import Listing from '@models/listing';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { promises as fs } from 'fs';
import { join } from "path";
import Chat from "@models/chat";

// This function creates a user to the database and is called when a POST request is made to /api/profile
export async function POST(req) {
    try {
        const {admin, name, surname, email, phone_number, password, path, post_counter, listing_counter} = await req.json();   // Get the name, surname, email, password and path from the request body
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        await connectMongoDB(); // Connect to MongoDB
        const newUser = await User.create({ admin, name, surname, email, phone_number, password: hashedPassword, path, post_counter, listing_counter}); // Save the user to the database

        return NextResponse.json({
            message: "User registered.",
            user: newUser
        }, {status: 201}); // Return a success message
    } catch (error) {
        return NextResponse.json({message: "An error occurred while registering the user."}, {status: 500});    // Return an error message
    }
}

// This function returns all the users in the database and is called when a GET request is made to /api/profile
export async function GET(req) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        const users = await User.find(); // Get the users
        if (!users) {
            return NextResponse.json({message: "users not found."}, {status: 404}); // Return a 404 if users is not found
        }
        return NextResponse.json({users}); // Return the users
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching users."}, {status: 500});    // Return an error message
    }
}

// This function deletes a user with a specific id and is called when a DELETE request is made to /api/profile
export async function DELETE(req) {
    try {
        const id = req.nextUrl.searchParams.get("id"); // Get the id from the query parameters
        await connectMongoDB(); // Connect to MongoDB

        // Step 0: Find if user exists
        const user = await User.findById(id); // Get the user with this id
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 }); // Return a 404 if user is not found
        }

        // Step 1: Find and delete all the chats of the user
        const chats = user.chats; // Get all chats of this user
        console.log("user to delete: ", user);
        console.log("chats: ", chats);
        for (const chatId of chats) {
            const chat = await Chat.findById(chatId); // Get the chat with this id
            if (!chat) {
                console.error(`Chat with ID ${chatId} not found`);
                continue;
            }
            
            // Remove the chat from the two users' chat arrays
            console.log("chat.participants: ", chat.participants);
            for (const participantId of chat.participants) {
                try {
                    const user = await User.findById(participantId);
                    if (user) {
                        user.chats = user.chats.filter(cId => cId.toString() !== chatId.toString());
                        await user.save(); // Save the user document to persist changes
                    } else {
                        console.error(`User with ID ${participantId} not found`);
                    }
                } catch (error) {
                    console.error(`Error updating user with ID ${participantId}:`, error);
                }
            }

            await Chat.findByIdAndDelete(chatId); // Delete the chat with this id
        }
        

        // Step 2: Find and delete all posts associated with this user
        const posts = await Post.find({ userId: id }); // Get all posts by this user
        // Delete all associated files
        for (const post of posts) {
            if (post.path && post.path !== 'no-file') {
                const rootDir = process.cwd();
                const filePath = join(rootDir, '/public', post.path);
                
                try {
                    await fs.unlink(filePath);
                } catch (error) {
                    console.error(`Failed to delete file: ${filePath}`, error);
                }
            }
        }
        // Delete the posts themselves
        await Post.deleteMany({ userId: id });

        // Step 3: Find and delete all listings associated with this user
        const listings = await Listing.find({ userId: id }); // Get all listings by this user
        // Delete all associated files
        for (const listing of listings) {
            if (listing.path && listing.path !== 'no-file') {
                const rootDir = process.cwd();
                const filePath = join(rootDir, '/public', listing.path);
                
                try {
                    await fs.unlink(filePath);
                } catch (error) {
                    console.error(`Failed to delete file: ${filePath}`, error);
                }
            }
        }
        // Delete the listings themselves
        await Listing.deleteMany({ userId: id });

        // Step 4: Delete the user
        await User.findByIdAndDelete(id); // Delete the user with this id

        return NextResponse.json({ message: "User and associated posts, listings and files deleted." }, { status: 200 }); // Return a success message
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        return NextResponse.json({ message: "An error occurred while deleting the user, posts, listings and files." }, { status: 500 }); // Return an error message
    }
}