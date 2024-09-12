import connectMongoDB from "@lib/mongodb";
import Post from "@models/post";
import { NextResponse } from "next/server";

// This function returns a post with a specific id
export async function GET(req, {params}) {
    try {
        const { id } = params;
        await connectMongoDB();
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({message: "post not found."}, {status: 404}); // Return a 404 if post is not found
        }
        return NextResponse.json({post}); // Return the post
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching post."}, {status: 500}); // Return an error message
    }
}