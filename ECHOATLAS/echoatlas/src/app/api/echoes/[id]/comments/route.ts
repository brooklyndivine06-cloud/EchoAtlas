import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const comments = await prisma.comment.findMany({
    where:{ echoId:id, parentId:null },
    include:{ user:{ select:{ id:true, name:true, username:true, profileImage:true } }, replies:{ include:{ user:{ select:{ id:true,name:true,username:true,profileImage:true } } } } },
    orderBy:{ createdAt:"asc" }
  })
  return NextResponse.json({ comments })
}

export async function POST(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const { content, parentId } = await req.json()
  if (!content || !content.trim()) return NextResponse.json({ error:"Content required" },{ status:400 })
  const comment = await prisma.comment.create({
    data:{ echoId:id, userId:user.id, content: content.trim(), parentId: parentId||null },
    include:{ user:{ select:{ id:true,name:true,username:true,profileImage:true } } }
  })
  const echo = await prisma.echo.findUnique({ where:{ id } })
  if (echo && echo.authorId !== user.id) {
    await prisma.notification.create({ data:{
      userId: echo.authorId, actorId:user.id, echoId:id, type:"comment", title:`${user.name} commented on your Echo`, body: content.slice(0,120)
    }})
  }
  return NextResponse.json({ comment })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id:string }> }) {
  // delete comment via query param? we handle via separate route but implement here for simplicity
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const { searchParams } = new URL(req.url)
  const commentId = searchParams.get("commentId")
  if (!commentId) return NextResponse.json({ error:"commentId required" },{ status:400 })
  const c = await prisma.comment.findUnique({ where:{ id: commentId } })
  if (!c || c.userId !== user.id) return NextResponse.json({ error:"Forbidden" },{ status:403 })
  await prisma.comment.delete({ where:{ id: commentId } })
  return NextResponse.json({ ok:true })
}
