import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function checks if two users are connected in the database
export async function POST(req) {
    try {
        const { id1, id2 } = await req.json();
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : id1 });
        
        // If connection exists
        if (user.connections.includes(id2)) {

            return NextResponse.json({
                message: "connection exists",
                success: true
            });
        }

        // If connection does not exist
        return NextResponse.json({
            message: "connection does not exist",
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}