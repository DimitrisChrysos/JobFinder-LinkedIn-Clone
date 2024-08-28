import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// This function updates a user with a specific id and is called when a PUT request is made to /api/profile/[id]
export async function PUT(req, {params}) {
    try {
        const { id } = params;
        const {
            newJobPos: job_position, 
            newEmploymentAgency: employment_agency, 
            newExperience: experience, 
            newEducation: education, 
            newSkills: skills} = await req.json();
        await connectMongoDB();
        await User.findByIdAndUpdate(id, {job_position, employment_agency, experience, education, skills});
        return NextResponse.json({message: "User updated."}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "An error occurred while updating the user."}, {status: 500});
    }
}

// This function returns a user with a specific id and is called when a GET request is made to /api/profile/[id]
export async function GET(req, {params}) {
    try {
        const { id } = params;
        await connectMongoDB();
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({message: "users not found."}, {status: 404}); // Return a 404 if user is not found
        }
        return NextResponse.json({user}); // Return the user
    } catch (error) {
        return NextResponse.json({message: "An error occurred while fetching user."}, {status: 500});    // Return an error message
    }
}