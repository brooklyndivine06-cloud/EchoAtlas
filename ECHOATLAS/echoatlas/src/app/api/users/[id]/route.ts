import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id:string }> }){
  const { id } = await params
  let user = await prisma.user.findUnique({ where:{ id } })
  if(!user) user = await prisma.user.findUnique({ where:{ username: id } })
  if(!user) return NextResponse.json({ error:"Not found" },{ status:404 })
  const followers = await prisma.follow.count({ where:{ followingId:user.id } })
  const following = await prisma.follow.count({ where:{ followerId:user.id } })
  const echoes = await prisma.echo.findMany({ where:{ authorId:user.id }, include:{ media:true, tags:{ include:{ tag:true } }, _count:{ select:{ likes:true, comments:true } } }, orderBy:{ createdAt:"desc" } })
  return NextResponse.json({ user: { id:user.id, name:user.name, username:user.username, bio:user.bio, profileImage:user.profileImage, location:user.location, createdAt:user.createdAt }, followers, following, echoes })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id:string}>}){
  // simple profile update - require auth handled via cookie
  const { getUserFromRequest } = await import("@/lib/auth")
  const me = await getUserFromRequest(req)
  if(!me) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const { id } = await params
  if(me.id !== id && me.username !== id && !me.isAdmin) return NextResponse.json({ error:"Forbidden" },{ status:403 })
  const body = await req.json()
  const updated = await prisma.user.update({ where:{ id: me.id }, data:{ name: body.name, bio: body.bio, location: body.location, profileImage: body.profileImage } })
  return NextResponse.json({ user: updated })
}
