import connectMongoDB from "@lib/mongodb";
import Chat from "@models/chat";
import User from "@models/user";
import { NextResponse } from "next/server";

// Create a new chat between two users
export async function POST(req) {
    try {
        const { userId1, userId2 } = await req.json();
        await connectMongoDB(); // Connect to MongoDB
        
        // Create a new chat
        const chat = await Chat.create({ participants: [userId1, userId2] });

        // Add chat to user1
        const updateUser1 = await User.updateOne({ _id : userId1}, {
            $push: { chats: chat._id }
        })

        // Add chat to user2
        const updateUser2 = await User.updateOne({ _id : userId2}, {
            $push: { chats: chat._id }
        })

        return NextResponse.json({
            message: "Chat created",
            data: chat._id,
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}

// Get all chats of a user
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : userId });
        const chatIds = user.chats; // Get the chatIds of the user
        
        // Return all the chats
        const chats = [];
        for (const chatId of chatIds) {
            const chat = await Chat.findOne({ _id : chatId });
            chats.push(chat);
        }

        return NextResponse.json({
            message: "Fetched all the chats",
            chats: chats,
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}