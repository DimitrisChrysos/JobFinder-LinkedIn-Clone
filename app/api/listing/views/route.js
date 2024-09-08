import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Listing from "@models/listing";

// Add view to the listings of listingIds
export async function PUT(req) {
    try {
        const { listingIds } = await req.json();
        console.log("listingIds here:", listingIds);
        if (listingIds.length === 0) {
            return NextResponse.json({ message: "No listingIds provided." }, { status: 400 });
        }
        await connectMongoDB(); // Connect to MongoDB
        for (const listingId of listingIds) {
            const listing = await Listing.findOne({ _id: listingId }); // Find the listing
            if (!listing) {
                return NextResponse.json({message: `Listing not found for listingId: ${listing._id}`}, {status: 404}); // Return a 404 if the listing is not found
            }
            listing.views += 1; // Increment the views
            await listing.save(); // Save the updated listing
        }
        return NextResponse.json(
            { message: "Views incremented by one, for each listing of listingsIds." }, 
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: `An error occurred while incrementing the views: ${error.message}` },
            { status: 500 }
        );
    }
}

// Get the views of the listing with listingId
export async function GET(req) {
    try {
        const listingId = req.nextUrl.searchParams.get("listingId");
        await connectMongoDB(); // Connect to MongoDB
        const listing = await Listing.findOne({ _id: listingId }); // Find the listing
        if (!listing) {
            return NextResponse.json({ message: `Listing not found for listingId: ${listingId}` }, { status: 404 }); // Return a 404 if the listing is not found
        }
        return NextResponse.json(
            { views: listing.views }, 
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: `An error occurred while fetching the views: ${error.message}` },
            { status: 500 }
        );        
    }
}