import connectMongoDB from "@lib/mongodb";
import User from "@models/user";
import { NextResponse } from "next/server";

// This function updates a users last chat
export async function PUT(req, {params}) {
    try {
        const { id } = params;
        const {
            newChatId: lastChatId
        } = await req.json();
        await connectMongoDB();
        await User.findByIdAndUpdate(id, {lastChatId});
        const user = await User.findOne({ _id : id });
        return NextResponse.json({
            message: "Users last chat Id updated.",
            data: user
        }, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "An error occurred while updating the user."}, {status: 500});
    }
}