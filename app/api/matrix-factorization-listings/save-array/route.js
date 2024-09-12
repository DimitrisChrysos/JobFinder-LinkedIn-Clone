import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import MatrixListings from "@models/matrixListings";

// Save a new chunk to form a Matrix
export async function POST(req) {
    try {
        const { matrix } = await req.json();
        await connectMongoDB(); // Connect to MongoDB

        // Create a new matrix
        await MatrixListings.create({ data: matrix });

        return NextResponse.json({
            message: "Matrix saved successfully",
            error: false
        });
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}