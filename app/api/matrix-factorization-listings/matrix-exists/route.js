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
            return NextResponse.json({
                message: "Matrix exists",
                data: existingMatrix.data,
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