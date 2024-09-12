import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

// This route is used to upload a file to the server
// The file is saved in the public/assets/listing_files directory
// The file is saved with the name of the user's email address to ensure uniqueness
export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get("file");
        const listing_counter = data.get("listing_counter");
        const email = data.get("email");
        
        if (!file || !listing_counter || !email) {
            return NextResponse.json({ success: false });
        }
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const rootDir = process.cwd();
        const newName = listing_counter + "_" + email + "_" + file.name;
        const path = join(rootDir, 'public/assets/', 'listing_files/', newName);
        
        await writeFile(path, buffer);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: "An error occurred while uploading the file." }, { status: 500 });    // Return an error message
    }
}
