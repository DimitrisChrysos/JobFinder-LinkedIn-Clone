import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Post from "@models/post";

// This function returns all the posts in the database
export async function GET(req) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        const posts = await Post.find(); // Get the posts
        if (!posts) {
            return NextResponse.json({message: "Posts not found."}, {status: 404}); // Return a 404 if posts are not found
        }
        return NextResponse.json({posts}); // Return the posts
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching the posts."}, {status: 500}); // Return an error message
    }
}