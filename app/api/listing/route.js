import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Listing from "@models/listing";

// This function creates a post to the database and is called when a POST request is made to /api/post
export async function POST(req) {
    try {
        const {userId, job_pos, description, path} = await req.json();
        console.log("userId here:", userId, "job_pos here:", job_pos, "description here:", description, "path here:", path);

        await connectMongoDB(); // Connect to MongoDB
        let listing;
        console.log("xm???!")
        if (!path) {
            if (description == "" && job_pos != "")
                listing = await Listing.create({ userId, job_pos, description: "no-text", path: "no-file" });
            else if (description != "" && job_pos == "")
                listing = await Listing.create({ userId, job_pos: "no-text", description, path: "no-file" });
            else
                listing = await Listing.create({ userId, job_pos, description, path: "no-file" });
        }
        else if (description == "" && job_pos != "")
            listing = await Listing.create({ userId, job_pos, description: "no-text", path });
        else if (description != "" && job_pos == "")
            listing = await Listing.create({ userId, job_pos: "no-text", description, path });
        else if (description == "" && job_pos == "")
            listing = await Listing.create({ userId, job_pos: "no-text", description: "no-text", path });
        else
            listing = await Listing.create({ userId, job_pos, description, path }); // Create the listing
        
        return NextResponse.json({message: "Listing Created.", listing}, {status: 201}); // Return a success message
    } catch (error) {
        return NextResponse.json({message: "An error occurred while creating the listing." + error}, {status: 500});    // Return an error message
    }
}

// This function returns all the listings in the database from a specific user id and is called when a GET request is made to /api/listing
export async function GET(req) {
    try {
        const id = req.nextUrl.searchParams.get("id"); // Get the id from the query parameters
        await connectMongoDB(); // Connect to MongoDB


        const listings = await Listing.find({ userId: id }); // Get the listings
        if (!listings) {
            return NextResponse.json({message: "Listings not found."}, {status: 404}); // Return a 404 if listings are not found
        }
        return NextResponse.json({listings}); // Return the listings
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching the listings."}, {status: 500});    // Return an error message
    }
}