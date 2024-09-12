import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function returns all the notifications a user has in the database
export async function GET(req, {params}) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        const { id } = params;

        // Get the notifications of the user
        const user = await User.findOne({ _id : id }).populate({
            path: 'notifications.userId',
            select: '_id name surname path'
        });
        const notificationsList = user.notifications;

        return NextResponse.json({ 
            message: "List of notifications returned", 
            data: notificationsList,
            success: true
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ 
            message: "An error occured while getting the notifications:" + error.message || error,
            error: true
        }, { status: 500 });
    }
}

// This function deletes a notification from the database
export async function DELETE(req, {params}) {
    try {
        const { id } = params;
        const { searchParams } = new URL(req.url);
        const notificationId = searchParams.get('notificationId');
        await connectMongoDB(); // Connect to MongoDB
        
        // Remove the notification from the user who posted the post
        const updatePostUser = await User.updateOne({ _id : id}, {
            $pull: { notifications: { _id: notificationId } }
        })

        return NextResponse.json({
            message: "Notification deleted",
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            message: "An error occured while deleting the notification:" + error.message || error,
            error: true
        })
    }
}