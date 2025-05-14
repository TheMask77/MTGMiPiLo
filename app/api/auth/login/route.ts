import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.users.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const isValid = user.hashed_password && await bcrypt.compare(password, user.hashed_password)
  if (!isValid || !user.hashed_password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const cookieStore = await cookies();
  cookieStore.set('user_id', String(user.id), { httpOnly: true });

  return NextResponse.json({ message: 'Logged in' })
}
