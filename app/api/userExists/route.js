import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function returns checks for the existance of a user in the database and returns it
export async function POST(req) {
    try {        
        await connectMongoDB(); // Connect to MongoDB
        const {email} = await req.json();
        const user = await User.findOne({email}).select("_id");
        return NextResponse.json({ user }); // Return the user
    } catch (error) {
        console.log(error);
    }
}