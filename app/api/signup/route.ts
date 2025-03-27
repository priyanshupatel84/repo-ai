import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import * as z from "zod";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);
    const userEmail = email.toLowerCase().trim();
    
    const existingUser = await db.user.findUnique({ where: { email : userEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userName = name.toLowerCase().trim();
    
    const user = await db.user.create({
      data: {
        name : userName,
        email : userEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}