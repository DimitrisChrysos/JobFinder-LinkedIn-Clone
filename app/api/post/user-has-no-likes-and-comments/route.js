import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// Check if user has no likes and comments
export async function GET(req) {
    try {
        const userId = req.nextUrl.searchParams.get("userId");
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id: userId }); // Find the post
        if (!user) {
            return NextResponse.json({ message: `User not found for userId: ${userId}` }, { status: 404 }); // Return a 404 if the user is not found
        }
        const combinationLikesComments = user.likedPosts.length + user.commentedPosts.length;
        return NextResponse.json(
            { hasNoLikesComments: combinationLikesComments === 0 }, 
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: `An error occurred while checking if user has no likes and comments: ${error.message}` },
            { status: 500 }
        );
    }
}