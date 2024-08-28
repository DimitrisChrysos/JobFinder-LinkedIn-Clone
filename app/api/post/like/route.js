import connectMongoDB from "@lib/mongodb";
import Post from "@models/post";
import User from "@models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { _id, userId } = await req.json(); // _id -> postId, userId -> userId
        await connectMongoDB(); // Connect to MongoDB
        const post = await Post.findOne({ _id : _id });
        const user = await User.findOne({ _id : userId });

        // Check if the user has already liked the post and unlike it
        if (post.like.includes(userId)) {

            // Remove the user from the like array of the post
            const updatePost = await Post.updateOne({ _id : _id}, {
                $pull : { like: userId }
            })

            // Remove the post from the like array of the user
            const updateUser = await User.updateOne({ _id : userId}, {
                $pull : { likedPosts: _id }
            })

            // Check if the user has commented on the post
            const hasCommented = post.comment.some(comment => comment.userId.toString() === userId);
        
            // If the user has not commented on the post, remove the post from the user's interactedWithPosts array
            if (!hasCommented) {
                const updateUser = await User.updateOne({ _id : userId}, {
                    $pull : { interactedWithPosts: _id }
                })
            }

            // Remove the notification from the user who posted the post
            // only if the post creator is not the one who liked the post and the notification exists
            if (post.userId !== userId) {
                const notifUser = await User.findOne({ _id: post.userId, 'notifications.description': ' liked your ', 'notifications.userId': userId, 'notifications.postId': post._id });
    
                if (notifUser) {
                    const updatePostUser = await User.updateOne({ _id : post.userId}, {
                        $pull: { notifications: { description: " liked your ", userId: userId, postId: post._id} }
                    })
                }
            }

            const postData = await Post.findOne({ _id : _id });
            return NextResponse.json({
                message: "the post was unliked",
                data: postData.like,
                success: true
            });
        }

        // If the user has not liked the post, like the post
        const updatePost = await Post.updateOne({ _id : _id}, {
            $push: { like: userId }
        })

        // Add the post to the like array of the user
        const updateUser = await User.updateOne({ _id : userId}, {
            $push : { likedPosts: _id }
        })

        // Add the post to the user's interactedWithPosts array if an interaction doesn't already exist
        if (!user.interactedWithPosts.includes(_id)) {
            const updateUser = await User.updateOne({ _id : userId}, {
                $push: { interactedWithPosts: _id }
            })
        }

        // Add a notification to the user who posted the post,
        // if the post creator is not the one who liked the post
        if (post.userId !== userId) {
            const updatePostUser = await User.updateOne({ _id : post.userId}, {
                $push: { notifications: { description: " liked your ", userId: userId, postId: post._id} }
            })
        }
        
        const postData = await Post.findOne({ _id : _id });
        return NextResponse.json({
            message: "Liked",
            data: postData.like,
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}