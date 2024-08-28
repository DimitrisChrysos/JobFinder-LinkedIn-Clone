import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function sends/deletes a connection request to a user in the database and is called when a POST request is made to /api/connections/requests
export async function POST(req) {
    try {
        const { _id, senderId } = await req.json(); // _id -> receiverId, senderId -> receiverId
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : _id });
        
        // If the sender has already send a request to the receiver, remove it
        if (user.connectionRequests.includes(senderId)) {

            const updateUser = await User.updateOne({ _id : _id}, {
                $pull : { connectionRequests: senderId }
            })

            const userData = await User.findOne({ _id : _id });
            return NextResponse.json({
                message: "cancelled the connection request",
                data: userData.connectionRequests,
                success: true
            });
        }

        // If the sender has not already send a request to the receiver, add the request
        const updateUser = await User.updateOne({ _id : _id}, {
            $push: { connectionRequests: senderId }
        })

        const userData = await User.findOne({ _id : _id });

        return NextResponse.json({
            message: "made the connection request",
            data: userData.like,
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}