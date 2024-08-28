import connectMongoDB from "@lib/mongodb";
import Post from "@models/post";
import User from "@models/user";
import { NextResponse } from "next/server";

// Add a comment to a post
export async function POST(req) {
    try {
        const { description, postId, userId } = await req.json();
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : userId });
        const post = await Post.findOne({ _id : postId });
        
        // Add a comment to the post
        const commentPost = await Post.updateOne({ _id : postId }, {
            $push: { comment: { description: description, userId: userId } }
        });

        // Add the post to the comment array of the user
        const updateUser = await User.updateOne({ _id : userId}, {
            $push : { commentedPosts: postId }
        })

        // Add the post to the user's interactedWithPosts array if an interaction doesn't already exist
        if (!user.interactedWithPosts.includes(postId)) {
            const updateUser = await User.updateOne({ _id : userId}, {
                $push: { interactedWithPosts: postId }
            })
        }

        // Add a notification to the user who posted the post,
        // only if the post creator is not the one who commented on the post
        if (post.userId !== userId) {
            const updatePostUser = await User.updateOne({ _id : post.userId}, {
                $push: { notifications: { description: " commented on your ", userId: userId, postId: post._id} }
            })
        }

        // Get all the comments of the post
        const commentList = await Post.find({ _id : postId }).populate({
            path: 'comment',
            populate: {
                path: 'userId',
            }
        });

        return NextResponse.json({
            message: "Comment added",
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