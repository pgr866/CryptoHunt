import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, email, password, username, timezone } = body;

    if (!id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    if (timezone && !email && !username && !password) {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { timezone },
      });

      return NextResponse.json({ message: "User updated successfully", user: updatedUser }, { status: 200 });
    }

    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Incorrect password" }, { status: 400 });
    }

    const updatedData: any = {};

    if (email && email !== user.email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email, NOT: { id: user.id } },
      });
      if (existingEmail) {
        return NextResponse.json({ message: "Email is already in use" }, { status: 400 });
      }
      updatedData.email = email;
    }

    if (username && username !== user.username) {
      const existingUsername = await prisma.user.findFirst({
        where: { username, NOT: { id: user.id } },
      });
      if (existingUsername) {
        return NextResponse.json({ message: "Username is already taken" }, { status: 400 });
      }
      updatedData.username = username;
    }

    if (timezone && timezone !== user.timezone) {
      updatedData.timezone = timezone;
    }

    if (!updatedData.email && !updatedData.username && !updatedData.timezone) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updatedData,
    });

    return NextResponse.json({ message: "User updated successfully", user: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
  }
}
