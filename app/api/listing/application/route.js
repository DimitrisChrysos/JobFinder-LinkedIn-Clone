import connectMongoDB from "@lib/mongodb";
import Listing from "@models/listing";
import User from "@models/user";
import { NextResponse } from "next/server";


// Add an application to the listing
export async function POST(req) {
    try {
        const { description, listingId, userId } = await req.json();
        await connectMongoDB(); // Connect to MongoDB
        const user = await User.findOne({ _id : userId });
        
        // Add an application to the listing
        const applicationListing = await Listing.updateOne({ _id : listingId }, {
            $push: { application: { description: description, userId: userId } }
        });

        // Get all the applications of the listing
        const applicationList = await Listing.find({ _id : listingId }).populate({
            path: 'application',
            populate: {
                path: 'userId',
            }
        });

        return NextResponse.json({
            message: "Application added",
            data: applicationList,
            success: true
        });
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}