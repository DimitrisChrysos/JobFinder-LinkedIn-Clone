import connectMongoDB from "@lib/mongodb";
import Listing from "@models/listing";
import { NextResponse } from "next/server";

// Get all the applications of a listing
export async function POST(req) {
    try {
        const { listingId } = await req.json();
        await connectMongoDB(); // Connect to MongoDB

        // Get all the applications of the listing
        const applicationList = await Listing.findOne({ _id : listingId }).populate({
            path: 'application',
            populate: {
                path: 'userId',
            }
        });

        return NextResponse.json({
            message: "Successfully fetched all applications",
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