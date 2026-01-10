import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    } ////////////////////

    const existinUser = await User.findOne({ email });
    if (existinUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    } ///////////////////////////

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    }); ////////////////////////////

    return NextResponse.json(
      { message: "user created successfully", user },
      { status: 201 }
    ); ///////////////////////////
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
