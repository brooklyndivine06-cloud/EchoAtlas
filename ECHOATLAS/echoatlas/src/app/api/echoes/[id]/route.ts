import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const echo = await prisma.echo.findUnique({
    where: { id },
    include: {
      author: true,
      media: true,
      tags: { include: { tag:true } },
      comments: { include: { user: { select:{ id:true, name:true, username:true, profileImage:true } } }, orderBy:{ createdAt:"asc"} },
      _count: { select:{ likes:true, comments:true } },
      thenVsNow: true,
    }
  })
  if (!echo) return NextResponse.json({ error:"Not found" }, { status:404 })
  // increment view
  await prisma.echo.update({ where:{ id }, data:{ viewCount:{ increment:1 } } }).catch(()=>{})
  // check if current user liked/bookmarked
  const user = await getUserFromRequest(req)
  let liked=false, bookmarked=false, isFollowing=false
  if (user) {
    const like = await prisma.like.findUnique({ where:{ userId_echoId:{ userId:user.id, echoId:id } } })
    liked = !!like
    const bm = await prisma.bookmark.findUnique({ where:{ userId_echoId:{ userId:user.id, echoId:id } } })
    bookmarked = !!bm
    if (echo.authorId !== user.id) {
      const f = await prisma.follow.findUnique({ where:{ followerId_followingId:{ followerId:user.id, followingId: echo.authorId } } })
      isFollowing = !!f
    }
  }
  return NextResponse.json({ echo, liked, bookmarked, isFollowing })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const echo = await prisma.echo.findUnique({ where:{ id } })
  if (!echo) return NextResponse.json({ error:"Not found" },{ status:404 })
  if (echo.authorId !== user.id && !user.isAdmin) return NextResponse.json({ error:"Forbidden" },{ status:403 })
  await prisma.echo.delete({ where:{ id } })
  return NextResponse.json({ ok:true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const body = await req.json()
  const echo = await prisma.echo.findUnique({ where:{ id } })
  if (!echo || echo.authorId !== user.id) return NextResponse.json({ error:"Forbidden" },{ status:403 })
  const updated = await prisma.echo.update({ where:{ id }, data:{
    title: body.title, story: body.story, mood: body.mood, visibility: body.visibility
  }})
  return NextResponse.json({ echo: updated })
}
