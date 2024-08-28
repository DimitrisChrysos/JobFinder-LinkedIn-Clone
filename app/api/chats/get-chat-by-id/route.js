import connectMongoDB from "@lib/mongodb";
import Chat from "@models/chat";
import { NextResponse } from "next/server";

// This function returns the chat with the given id
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const chatID = searchParams.get('chatId');
        await connectMongoDB(); // Connect to MongoDB
        const chat = await Chat.findOne({ _id : chatID });

        // return chat
        return NextResponse.json({
            message: "returned chat",
            data: chat,
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}