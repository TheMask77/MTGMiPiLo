import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { username, email, password } = await req.json()

  if (!username || !email || !password) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
  }

  const email_verified = email

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: 'Email is already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        email_verified, 
        hashed_password: hashedPassword,
        image: 'image',
      },
    })

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
