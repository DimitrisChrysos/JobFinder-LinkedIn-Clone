import connectMongoDB from "@lib/mongodb";
import Post from "@models/post";
import { NextResponse } from "next/server";

// Get all the comments of a post
export async function POST(req) {
    try {
        const { postId } = await req.json();
        await connectMongoDB(); // Connect to MongoDB

        // Get all the comments of the post
        const commentList = await Post.findOne({ _id : postId }).populate({
            path: 'comment',
            populate: {
                path: 'userId',
            }
        });

        return NextResponse.json({
            message: "Successfully fetched all comments",
            data: commentList,
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}