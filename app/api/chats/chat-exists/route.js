import connectMongoDB from "@lib/mongodb";
import Chat from "@models/chat";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function checks if a chat exists in the database and is called when a POST request is made to /api/chat/chat-exists
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id1 = searchParams.get('id1');
        const id2 = searchParams.get('id2');
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : id1 });
        const user1 = await User.findOne({ _id : id1 });
        const chatIds = user.chats; // Get the chatIds of the user
        
        // if users don't exist
        if (!user || !user1) {
            return NextResponse.json({
                message: "User not found",
                success: false
            });
        }

        // check if chat exists
        for (const chatId of chatIds) {
            const chat = await Chat.findOne({ _id : chatId });
            if (chat && chat.participants.includes(id2)) {
                return NextResponse.json({
                    message: "chat exists",
                    data: chatId,
                    success: true
                });
            }
        }

        // if chat doesn't exist
        return NextResponse.json({
            message: "chat does not exist",
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}