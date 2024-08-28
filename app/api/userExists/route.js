import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function is called when a POST request is made to /api/userExists
export async function POST(req) {
    try {        
        await connectMongoDB(); // Connect to MongoDB
        const {email} = await req.json();
        const user = await User.findOne({email}).select("_id");
        console.log("user: ", user);

        return NextResponse.json({ user }); // Return the user
    } catch (error) {
        console.log(error);
    }
}