import mongoose, { mongo } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log("DB connected");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("DB connected");
  } catch (error) {
    console.error("Error connecting to DB", error);
  }
}
