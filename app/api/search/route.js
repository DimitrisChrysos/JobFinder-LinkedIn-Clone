import User from "@models/user";
import connectMongoDB from "@lib/mongodb";
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get('query');
  
      if (!query) {
        return NextResponse.json({ users: [] }, { status: 200 });
      }
  
      await connectMongoDB();
  
      const users = await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { surname: { $regex: query, $options: 'i' } },
        ],
      });
  
      return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: 'Error searching users', error }, { status: 500 });
    }
  }
  
  export const config = {
    api: {
      bodyParser: false,
    },
  };