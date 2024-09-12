import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function returns all the connection requests a user has in the database
export async function GET(req, {params}) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        const { id } = params;
        const user = await User.findOne({ _id : id });
        if (!user) {
            return NextResponse.json({message: "User not found."}, {status: 404}); // Return a 404 if user is not found
        }

        const reqIds = user.connectionRequests; // Get the ids of the users with requests

        const reqList = await User.find({
            _id: { $in: reqIds } 
       });

       // Get the information of the users with requests
       const reqInfo = reqList.map((userInfo) => {
            return {
                _id: userInfo._id,
                name: userInfo.name,
                surname: userInfo.surname,
                path: userInfo.path,
            }
        })

        return NextResponse.json({
            message: "List of requests",
            data: reqInfo,
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}