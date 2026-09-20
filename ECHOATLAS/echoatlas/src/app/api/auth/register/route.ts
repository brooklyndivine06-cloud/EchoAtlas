import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, createSession } from "@/lib/auth"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    const { name, username, email, password } = parsed.data

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) return NextResponse.json({ error: "Email or username already taken" }, { status: 400 })

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, username, email, passwordHash, bio: "Explorer of hidden stories." },
    })
    await createSession(user.id)
    return NextResponse.json({ user: { id: user.id, name: user.name, username: user.username, email: user.email } })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
