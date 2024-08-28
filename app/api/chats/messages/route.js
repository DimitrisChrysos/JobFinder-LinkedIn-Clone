import { NextResponse } from 'next/server';
import connectMongoDB from "@lib/mongodb";
import Chat from '@models/chat';

// add a message to a chat in the database
export async function POST(req) {
    try {
        const { chatId, senderId, receiverId, content } = await req.json();
        await connectMongoDB();
        const chat = await Chat.findOne({ _id: chatId });

        // Add the message to the chat
        const newMessage = await Chat.updateOne({ _id: chatId }, {
            $push: { message: { senderId, receiverId, chatId, content } }
        });

        // Get all the messages of the chat
        const chatMessages = await Chat.find({ _id: chatId }).populate({
            // path: 'message',
            // populate: {
            //     path: 'senderId'
            // }
            path: 'message.senderId message.receiverId',
            select: '_id name path', // Select fields to populate
        });

        return NextResponse.json({ 
            message: "Message sent.", 
            data: chatMessages,
            success: true
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ 
            message: "An error occurred while sending the message." + error.message || error,
            error: true
        }, { status: 500 });
    }
}

// Get all the messages of a chat
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get('chatId');
        await connectMongoDB(); // Connect to MongoDB

        // Get all the messages of the chat
        const chatMessages = await Chat.find({ _id: chatId }).populate({
            // path: 'message',
            // populate: {
            //     path: 'senderId'
            // }
            path: 'message.senderId message.receiverId',
            select: '_id name path', // Select fields to populate
        });

        return NextResponse.json({ 
            message: "Successfully fetched all messages",
            data: chatMessages,
            success: true
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ 
            message: "An error occurred while fetching messages: " + error.message || error,
            error: true,
        }, { status: 500 });
    }
}