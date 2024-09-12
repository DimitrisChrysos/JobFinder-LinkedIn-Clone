import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import MatrixListings from "@models/matrixListings";

// Check if a matrix exists and return the wanted information, if it does not 
// exist, return an appropriate message 
export async function GET(req, {params}) {
    try {
        await connectMongoDB(); // Connect to MongoDB
        const { id } = params;
        const userId = id;

        console.log("userId: ", userId);
        
        // Fetch the first chunk from the collection
        const firstChunk = await MatrixListings.findOne().sort({ createdAt: 1 }).limit(1);
        
        if (!firstChunk) {
            return NextResponse.json({
                message: "Fist chunk not found",
                error: false
            });
        }

        // Find the first row of the first chunk
        const firstRowOfFirstChunk = firstChunk.data[0]; // First row in the first chunk

        // Search for a chunk where any inner array has userId as the first element
        const chunk = await MatrixListings.findOne({ 
            data: { 
                $elemMatch: { 0: userId }  // Check if the first element of any sub-array is userId
            } 
        });
        // console.log("chunk: ", chunk);

        if (chunk) {
            // Find the row corresponding to the user within the chunk
            const userRow = chunk.data.find(row => row[0] === userId);

            if (userRow) {
                return NextResponse.json({
                    message: "User row found",
                    userRow,
                    firstRowOfFirstChunk,
                    success: true,
                    error: false
                });
            } else {
                return NextResponse.json({
                    message: "User row not found",
                    error: false
                });
            }
        } else {
            return new Response('User row not found', { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({
            message: error.message || error,
            error: true
        })
    }
}