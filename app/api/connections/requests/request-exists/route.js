import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function checks if a connection request to a user exists in the database
export async function POST(req) {
    try {
        const { _id, senderId } = await req.json(); // _id -> receiverId, senderId -> receiverId
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : _id });
        
        // If request exists
        if (user.connectionRequests.includes(senderId)) {

            return NextResponse.json({
                message: "request exists",
                success: true
            });
        }

        // if request has been sent but with switched roles
        const user1 = await User.findOne({ _id : senderId });
        if (user1.connectionRequests.includes(_id)) {

            return NextResponse.json({
                message: "request exists with switched roles",
                success: true
            });
        }

        // If request does not exist
        return NextResponse.json({
            message: "request does not exist",
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}