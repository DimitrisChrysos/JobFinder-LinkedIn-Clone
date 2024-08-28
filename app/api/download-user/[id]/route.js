import connectMongoDB from "@lib/mongodb";
import Listing from "@models/listing";
import Post from "@models/post";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function return a bunch of user data from a specific user id
export async function GET(req, {params}) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        const { id } = params;
        const user = await User.findOne({ _id : id });

        // Get the CV of the user
        const userCV = {
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone_number: user.phone_number,
            education: user.education,
            skills: user.skills,
        }
        
        // Get the posts of the user
        const userPosts = await Post.find({ userId: id }); 
        
        // Get the listings of the user
        const userListings = await Listing.find({ userId: id });

        // Get the proffecional experience of the user
        const userProfessionalExperience = {
            job_position: user.job_position,
            employment_agency: user.employment_agency,
            experience: user.experience,
        }

        // GET the likes of the user
        const userLikedPosts = await Post.find({ _id: { $in: user.likedPosts } });
        const userLikes = userLikedPosts.map(post => {
            return {
                postId: post._id,
                postCreator: post.userId,
                postText: post.text,
                postPath: post.path
            };
        });

        // Get the comments of the user
        const userCommentedPosts = await Post.find({ _id: { $in: user.commentedPosts } });
        const userComments = userCommentedPosts.map(post => {
            return {
                postId: post._id,
                postCreator: post.userId,
                postText: post.text,
                postPath: post.path,
                userComments: post.comment.filter(comment => comment.userId.toString() === id)
            };
        });

        // Construct the return object
        const downloadUserData = {
            userCV,
            userPosts,
            userListings,
            userProfessionalExperience,
            userLikes,
            userComments
        }

        return NextResponse.json({
            userId: id,
            UserData: downloadUserData,
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }   
} 