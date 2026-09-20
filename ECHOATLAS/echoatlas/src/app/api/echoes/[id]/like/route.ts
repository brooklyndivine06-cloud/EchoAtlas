import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error:"Unauthorized"},{ status:401 })
  const existing = await prisma.like.findUnique({ where:{ userId_echoId:{ userId:user.id, echoId:id } } })
  let liked
  if (existing) {
    await prisma.like.delete({ where:{ id: existing.id } })
    liked=false
  } else {
    await prisma.like.create({ data:{ userId:user.id, echoId:id } })
    liked=true
    // notification
    const echo = await prisma.echo.findUnique({ where:{ id } })
    if (echo && echo.authorId !== user.id) {
      await prisma.notification.create({ data:{
        userId: echo.authorId, actorId: user.id, echoId:id, type:"like", title:`${user.name} liked your Echo`, body: echo.title
      }})
    }
  }
  const count = await prisma.like.count({ where:{ echoId:id } })
  return NextResponse.json({ liked, count })
}
