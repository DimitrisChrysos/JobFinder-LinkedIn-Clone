import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { promises as fs } from 'fs';

// This route is used to upload a file to the server
// The file is saved in the public/assets/logo_images directory
// The file is saved with a name that includes users id to ensure uniqueness
export async function POST(req, {params}) {
    const { id } = params;

    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
        return NextResponse.json({ success: false });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const rootDir = process.cwd();
    const newName = id + "_" + file.name;
    const path = join(rootDir, 'public/assets', 'logo_images', newName);
    await writeFile(path, buffer);
    
    return NextResponse.json({ success: true });
}

export async function DELETE(req) {
    try {
        const { id, path } = await req.json();
        
        if (!id || !path) {
            return NextResponse.json({ message: "id and path are required." }, { status: 400 });
        }

        const rootDir = process.cwd();
        const imagePath = join(rootDir, "/public", path);
        
        await fs.unlink(imagePath);

        return NextResponse.json({ message: "file deleted." }, { status: 200 }); // Return a success message
    } catch (error) {
        return NextResponse.json({ message: "An error occurred while deleting the file." }, { status: 500 });    // Return an error message
    }
}


