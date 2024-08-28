import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function returns all the connections of a user in the database and is called when a GET request is made to /api/connection/get-all-connections/[id]
export async function GET(req, {params}) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        const { id } = params;
        const user = await User.findOne({ _id : id });
        if (!user) {
            return NextResponse.json({message: "User not found."}, {status: 404}); // Return a 404 if user is not found
        }

        const connectionsIds = user.connections; // Get the connectionsIds of the user

        const connectionsList = await User.find({
             _id: { $in: connectionsIds } 
        });

        // Get the information of the connected users
        const connectionsInfo = connectionsList.map((userInfo) => {
            return {
                _id: userInfo._id,
                name: userInfo.name,
                surname: userInfo.surname,
                email: userInfo.email,
                phone_number: userInfo.phone_number,
                path: userInfo.path,
                job_position: userInfo.job_position,
                employment_agency: userInfo.employment_agency,
                interactedWithPosts: userInfo.interactedWithPosts
            }
        })

        return NextResponse.json({
            message: "List of connections",
            data: connectionsInfo,
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}