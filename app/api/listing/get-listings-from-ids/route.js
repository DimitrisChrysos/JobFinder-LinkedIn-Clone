import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Listing from "@models/listing";

// This function returns all the listings from the given ids
export async function POST(req) {
    try {
        const { ids } = await req.json();
        await connectMongoDB(); // Connect to MongoDB
        const listings = await Listing.find({ _id: { $in: ids } }); // Get the listings

        if (!listings.length) {
            return NextResponse.json({message: "Listings not found."}, {status: 404}); // Return a 404 if listings are not found
        }

        // Create a map of listings for quick lookup
        const listingMap = new Map(listings.map(listing => [listing._id.toString(), listing]));

        // Filter the listings based on the ids existance
        const filteredListings = ids.map(id => listingMap.get(id)).filter(listing => listing !== undefined);

        return NextResponse.json({listings: filteredListings }); // Return the listings
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching the listings."}, {status: 500}); // Return an error message
    }
}