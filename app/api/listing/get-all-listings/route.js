import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Listing from "@models/listing";

// This function returns all the listings in the database
export async function GET(req) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        const listings = await Listing.find(); // Get the listings
        if (!listings) {
            return NextResponse.json({message: "Listings not found."}, {status: 404}); // Return a 404 if listings are not found
        }
        return NextResponse.json({listings}); // Return the listings
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching the listings."}, {status: 500}); // Return an error message
    }
}