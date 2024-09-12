import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function adds or removes a connection between two users
export async function POST(req) {
    try {
        const { _id, connectionId } = await req.json(); // Get the userId and connectionId from the request body
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : _id });
        
        // If already connected, remove connection
        if (user.connections.includes(connectionId)) {
            
            const updateUser = await User.updateOne({ _id : _id}, {
                $pull : { connections: connectionId }
            })

            const updateConnection = await User.updateOne({ _id : connectionId}, {
                $pull : { connections: _id }
            })

            const userData = await User.findOne({ _id : _id });
            return NextResponse.json({
                message: "Removed connection",
                data: userData.connections,
                success: true
            });
        }

        // If not already connections, add the connection
        const updateUser = await User.updateOne({ _id : _id}, {
            $push: { connections: connectionId }
        })

        const updateConnection = await User.updateOne({ _id : connectionId}, {
            $push: { connections: _id }
        })

        const userData = await User.findOne({ _id : _id });

        return NextResponse.json({
            message: "Added connection",
            data: userData.connections,
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}