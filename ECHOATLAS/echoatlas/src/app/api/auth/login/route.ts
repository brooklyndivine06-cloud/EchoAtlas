import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createSession } from "@/lib/auth"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status:400 })
  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status:401 })
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status:401 })
  await createSession(user.id)
  return NextResponse.json({ user: { id: user.id, name: user.name, username: user.username, email: user.email, isAdmin: user.isAdmin } })
}
