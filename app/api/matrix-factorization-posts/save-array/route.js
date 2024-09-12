import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import MatrixPosts from "@models/matrixPosts";

// Save a new chunk to form a Matrix
export async function POST(req) {
    try {
        const { matrix } = await req.json();
        await connectMongoDB(); // Connect to MongoDB

        // Create a new matrix
        await MatrixPosts.create({ data: matrix });

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