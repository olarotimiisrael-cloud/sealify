"use client";

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // Simulate user lookup
  const user = {
    id: '123',
    email,
    password: '$2a$10$eNqZ9J7RvXpFVxYyQzZ6OuLmKjG5nZ9J7RvXpFVxYyQzZ6OuLmKjG5' // Hashed password for 'password'
  };

  if (user && await bcrypt.compare(password, user.password)) {
    return NextResponse.json({ message: 'Login successful' });
  } else {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
}