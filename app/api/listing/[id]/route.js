import connectMongoDB from "@lib/mongodb";
import Listing from "@models/listing";
import { NextResponse } from "next/server";

// This function returns a listing with a specific id
export async function GET(req, {params}) {
    try {
        const { id } = params;
        await connectMongoDB();
        const listing = await Listing.findById(id);
        if (!listing) {
            return NextResponse.json({message: "listing not found."}, {status: 404}); // Return a 404 if listing is not found
        }
        return NextResponse.json({listing}); // Return the listing
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching listing."}, {status: 500}); // Return an error message
    }
}