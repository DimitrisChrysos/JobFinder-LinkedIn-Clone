import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Post from "@models/post";

// This function returns all the posts from the given ids
export async function POST(req) {
    try {
        const { ids } = await req.json();
        await connectMongoDB(); // Connect to MongoDB
        const posts = await Post.find({ _id: { $in: ids } }); // Get the posts

        if (!posts.length) {
            return NextResponse.json({message: "Posts not found."}, {status: 404}); // Return a 404 if posts are not found
        }

        // Create a map of posts for quick lookup
        const postMap = new Map(posts.map(post => [post._id.toString(), post]));

        // Filter the posts based on the ids existance
        const filteredPosts = ids.map(id => postMap.get(id)).filter(post => post !== undefined);

        return NextResponse.json({posts: filteredPosts }); // Return the posts
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching the posts."}, {status: 500}); // Return an error message
    }
}