import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import MatrixPosts from "@models/matrixPosts";

export async function DELETE(req) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        
        // Check if a matrix exists and delete it, by deleting all the chunks
        const existingMatrix = await MatrixPosts.findOne();
        if (existingMatrix) {
            await MatrixPosts.deleteMany({});
        }

        return NextResponse.json({
            message: "Matrix deleted successfully",
            error: false
        });
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}