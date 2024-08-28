import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Post from "@models/post";

// This function creates a post to the database and is called when a POST request is made to /api/post
export async function POST(req) {
    try {
        const {userId, text, path} = await req.json();

        await connectMongoDB(); // Connect to MongoDB

        if (!path)
            await Post.create({ userId, text, path: "no-file" }); // If the path is not provided, set it to "no-file"
        else if (text == "")
            await Post.create({ userId, text: "no-text", path }); // If the text is not provided, set it to "no-text"
        else
            await Post.create({ userId, text, path }); // Create the post
        
        return NextResponse.json({message: "Post Created."}, {status: 201}); // Return a success message
    } catch (error) {
        return NextResponse.json({message: "An error occurred while creating the post."}, {status: 500});    // Return an error message
    }
}

// This function returns all the posts in the database from a specific user id and is called when a GET request is made to /api/post
export async function GET(req) {
    try {
        const id = req.nextUrl.searchParams.get("id"); // Get the id from the query parameters
        await connectMongoDB(); // Connect to MongoDB
        const posts = await Post.find({ userId: id }); // Get the posts
        if (!posts) {
            return NextResponse.json({message: "Posts not found."}, {status: 404}); // Return a 404 if posts are not found
        }
        return NextResponse.json({posts}); // Return the posts
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching the posts."}, {status: 500});    // Return an error message
    }
}