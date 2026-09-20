import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  if (!q.trim()) return NextResponse.json({ echoes:[], users:[], tags:[] })
  const term = q.trim()
  const echoes = await prisma.echo.findMany({
    where:{
      visibility:"Public",
      OR:[
        { title:{ contains: term } },
        { story:{ contains: term } },
        { city:{ contains: term } },
        { address:{ contains: term } },
      ]
    },
    include:{ author:{ select:{ username:true, name:true, profileImage:true } }, media:true, tags:{ include:{ tag:true } } },
    take:10,
    orderBy:{ createdAt:"desc" }
  })
  const users = await prisma.user.findMany({
    where:{
      OR:[
        { username:{ contains: term } },
        { name:{ contains: term } },
        { bio:{ contains: term } },
      ]
    },
    take:6,
    select:{ id:true, name:true, username:true, profileImage:true, bio:true }
  })
  const tags = await prisma.tag.findMany({ where:{ name:{ contains: term } }, take:6 })
  return NextResponse.json({ echoes, users, tags })
}
