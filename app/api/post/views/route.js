import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Post from "@models/post";

// Add view to the posts with postIds
export async function PUT(req) {
    try {
        const { postIds } = await req.json();
        if (postIds.length === 0) {
            return NextResponse.json({ message: "No postIds provided." }, { status: 400 });
        }
        await connectMongoDB(); // Connect to MongoDB
        for (const postId of postIds) {
            const post = await Post.findOne({ _id: postId }); // Find the post
            if (!post) {
                return NextResponse.json({message: `Post not found for postId: ${post._id}`}, {status: 404}); // Return a 404 if the post is not found
            }
            post.views += 1; // Increment the views
            await post.save(); // Save the updated post
        }
        return NextResponse.json(
            { message: "Views incremented by one, for each post of postsIds." }, 
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: `An error occurred while incrementing the views: ${error.message}` },
            { status: 500 }
        );
    }
}