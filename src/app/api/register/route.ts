"use client";

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // Simulate user creation
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    email,
    password: hashedPassword
  };

  // Store the user in a database (simulated here)
  console.log('User registered:', user);

  return NextResponse.json({ message: 'User registered successfully' });
}