import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import MatrixListings from "@models/matrixListings";

// Check if a matrix exists and return it, if it does not 
// exist, return an appropriate message 
export async function GET(req) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        
        const existingMatrix = await MatrixListings.findOne();
        if (existingMatrix) {
            // Get all the chunks of the matrix
            const matrixChunks = existingMatrix;

            // Reconstruct the matrix from the chunks
            console.log("matrixChunks: ", matrixChunks);
            const reconstructedMatrix = matrixChunks.reduce((acc, chunk) => acc.concat(chunk), []);

            return NextResponse.json({
                message: "Matrix exists",
                data: reconstructedMatrix,
                error: false
            });
        }

        return NextResponse.json({
            message: "Matrix does not exist",
            error: false
        });
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}