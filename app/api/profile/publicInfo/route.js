import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function adds or removes a category from the publicInfo of a user in the database
export async function POST(req) {
    try {
        const { userId, category } = await req.json(); // _id -> postId, publicInfo -> publicInfo
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : userId });

        // If category is already in publicInfo, remove it
        if (user.publicInfo.includes(category)) {

            // Remove it
            const updateUser = await User.updateOne({ _id : userId}, {
                $pull : { publicInfo: category }
            })

            return NextResponse.json({
                message: "Removed category from publicInfo",
                success: true
            });
        }

        // If category is not already in publicInfo, add it
        const updatePost = await User.updateOne({ _id : userId}, {
            $push: { publicInfo: category }
        })
        
        return NextResponse.json({
            message: "Added category to publicInfo",
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}

// This function returns the publicInfo of a user in the database
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : userId });
        return NextResponse.json({
            message: "Fetched publicInfo",
            publicInfo: user.publicInfo,
            success: true
        })
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}