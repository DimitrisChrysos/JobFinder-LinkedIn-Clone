import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// This function updates user's password with a specific id and is called when a PUT request is made to /api/password/[id]
export async function PUT(req, {params}) {
    try {
        const { id } = params;
        const { newPassword: password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        await connectMongoDB();
        await User.findByIdAndUpdate(id, {password: hashedPassword});
        return NextResponse.json({message: "Password updated."}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "An error occurred while updating the password."}, {status: 500});
    }
}


