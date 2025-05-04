import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, timezone } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Username, email, and password are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email already in use.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username,
        email,
        password: hashedPassword,
        timezone,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[SIGNUP_ERROR]', error);
    return NextResponse.json({ message: 'Error creating account' }, { status: 500 });
  }
}
