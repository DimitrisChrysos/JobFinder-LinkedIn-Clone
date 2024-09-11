import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import MatrixPosts from "@models/matrixPosts";

// If a matrix already exists, delete it and save a new one
export async function POST(req) {
    try {
        const { matrix } = await req.json();
        await connectMongoDB(); // Connect to MongoDB

        // // Check if a matrix exists and delete to post a new one
        // const existingMatrix = await MatrixPosts.findOne();
        // if (existingMatrix) {
        //     await MatrixPosts.deleteMany({});
        // }

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