import connectMongoDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Matrix from "@models/matrix";

export async function POST(req) {
    try {
        const { matrix } = await req.json();
        await connectMongoDB(); // Connect to MongoDB

        // Check if a matrix exists and delete to post a new one
        const existingMatrix = await Matrix.findOne();
        if (existingMatrix) {
            await Matrix.deleteMany({});
        }

        // Create a new matrix
        await Matrix.create({ data: matrix });

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