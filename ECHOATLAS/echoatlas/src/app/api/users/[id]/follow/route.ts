import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params // target user id or username?
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error:"Unauthorized"},{ status:401 })
  // try id first, then username
  let target = await prisma.user.findUnique({ where:{ id } })
  if (!target) target = await prisma.user.findUnique({ where:{ username: id } })
  if (!target) return NextResponse.json({ error:"User not found"},{ status:404 })
  if (target.id === user.id) return NextResponse.json({ error:"Cannot follow yourself"},{ status:400 })
  const existing = await prisma.follow.findUnique({ where:{ followerId_followingId:{ followerId:user.id, followingId: target.id } } })
  if (existing) {
    await prisma.follow.delete({ where:{ id: existing.id } })
    return NextResponse.json({ following:false })
  } else {
    await prisma.follow.create({ data:{ followerId:user.id, followingId: target.id } })
    await prisma.notification.create({ data:{ userId: target.id, actorId:user.id, type:"follow", title:`${user.name} followed you` } })
    return NextResponse.json({ following:true })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  let target = await prisma.user.findUnique({ where:{ id } })
  if (!target) target = await prisma.user.findUnique({ where:{ username:id } })
  if (!target) return NextResponse.json({ error:"Not found"},{ status:404 })
  const followers = await prisma.follow.count({ where:{ followingId: target.id } })
  const following = await prisma.follow.count({ where:{ followerId: target.id } })
  let isFollowing=false
  if (user) {
    const f = await prisma.follow.findUnique({ where:{ followerId_followingId:{ followerId:user.id, followingId: target.id } } })
    isFollowing=!!f
  }
  return NextResponse.json({ followers, following, isFollowing })
}
