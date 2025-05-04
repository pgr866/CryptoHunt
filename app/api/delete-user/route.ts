import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email
    const password = body?.password

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Incorrect password" }, { status: 400 })
    }

    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    await prisma.account.deleteMany({
      where: { userId: user.id },
    })

    await prisma.user.delete({
      where: { id: user.id },
    })

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 })
  }
}
