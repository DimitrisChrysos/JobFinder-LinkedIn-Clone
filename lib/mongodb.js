import mongoose from "mongoose";

// Connect to MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("An error occurred while connecting to MongoDB: ", error);
  }
}

export default connectMongoDB