import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id:string }> }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const body = await req.json().catch(()=>({}))
  const collectionId = body.collectionId
  const existing = await prisma.bookmark.findUnique({ where:{ userId_echoId:{ userId:user.id, echoId:id } } })
  if (existing) {
    await prisma.bookmark.delete({ where:{ id: existing.id } })
    return NextResponse.json({ bookmarked:false })
  } else {
    // ensure collection if provided
    let colId = collectionId || null
    if (!colId) {
      // default collection
      let col = await prisma.collection.findFirst({ where:{ userId:user.id, name:"Saved" } })
      if (!col) col = await prisma.collection.create({ data:{ userId:user.id, name:"Saved" } })
      colId = col.id
    }
    await prisma.bookmark.create({ data:{ userId:user.id, echoId:id, collectionId: colId } })
    // notification
    const echo = await prisma.echo.findUnique({ where:{ id } })
    if (echo && echo.authorId !== user.id) {
      await prisma.notification.create({ data:{
        userId: echo.authorId, actorId:user.id, echoId:id, type:"bookmark", title:`${user.name} saved your Echo`, body: echo.title
      }})
    }
    return NextResponse.json({ bookmarked:true })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id:string }> }){
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ bookmarked:false })
  const bm = await prisma.bookmark.findUnique({ where:{ userId_echoId:{ userId:user.id, echoId:id } } })
  return NextResponse.json({ bookmarked: !!bm })
}
