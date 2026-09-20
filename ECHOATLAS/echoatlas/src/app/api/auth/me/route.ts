import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({ user: { id: user.id, name: user.name, username: user.username, email: user.email, profileImage: user.profileImage, bio: user.bio, isAdmin: user.isAdmin } })
}
