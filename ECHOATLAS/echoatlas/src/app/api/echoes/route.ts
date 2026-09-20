import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  const mood = searchParams.get("mood")
  const tag = searchParams.get("tag")
  const city = searchParams.get("city")
  const year = searchParams.get("year")
  const lat = parseFloat(searchParams.get("lat")||"")
  const lng = parseFloat(searchParams.get("lng")||"")
  const radius = parseFloat(searchParams.get("radius")||"50")
  const limit = Math.min(100, parseInt(searchParams.get("limit")||"30"))
  const offset = parseInt(searchParams.get("offset")||"0")

  let where:any = { visibility: "Public" }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { story: { contains: q } },
      { city: { contains: q } },
      { address: { contains: q } },
    ]
  }
  if (mood) where.mood = mood
  if (city) where.city = city
  if (year) {
    const y = parseInt(year)
    where.approximateYear = y
  }
  // tag filtering via relation
  if (tag) {
    where.tags = { some: { tag: { slug: tag.toLowerCase() } } }
  }

  // For proximity, fetch then filter in JS (sqlite has no geo)
  let echoes = await prisma.echo.findMany({
    where,
    include: {
      author: { select: { id:true, name:true, username:true, profileImage:true } },
      media: true,
      tags: { include: { tag: true } },
      _count: { select: { likes:true, comments:true } },
      likes: false
    },
    orderBy: { createdAt: "desc" },
    take: limit*3, // overfetch for radius filtering
    skip: offset,
  })

  if (!isNaN(lat) && !isNaN(lng)) {
    const haversine = (a:number,b:number,c:number,d:number)=>{
      const R=6371, dLat=(c-a)*Math.PI/180, dLon=(d-b)*Math.PI/180
      const aa=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2
      return 2*R*Math.asin(Math.sqrt(aa))
    }
    echoes = echoes.filter(e=> haversine(lat,lng,e.latitude,e.longitude) <= radius).slice(0,limit)
  } else {
    echoes = echoes.slice(0,limit)
  }

  // also need like counts
  return NextResponse.json({ echoes })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 })
  const body = await req.json()
  const { title, story, mood, tags, historicalPeriod, latitude, longitude, address, city, country, date, approximateYear, visibility, media } = body
  if (!title || !story || !latitude || !longitude) return NextResponse.json({ error:"Missing required fields" }, { status:400 })

  const echo = await prisma.echo.create({
    data: {
      title, story, mood: mood||"Nostalgic", historicalPeriod, latitude: parseFloat(latitude), longitude: parseFloat(longitude),
      address, city, country, date: date? new Date(date): null, approximateYear: approximateYear? parseInt(approximateYear): null,
      visibility: visibility||"Public", authorId: user.id,
      media: media ? { create: media.map((m:any)=>({ url: m.url, type: m.type||"image" })) } : undefined,
    },
    include: { media:true }
  })

  // handle tags
  if (tags && Array.isArray(tags) && tags.length>0) {
    for (const t of tags) {
      const name = String(t).trim()
      if (!name) continue
      const slug = name.toLowerCase().replace(/\s+/g,'-')
      let tag = await prisma.tag.findUnique({ where:{ slug } })
      if (!tag) tag = await prisma.tag.create({ data:{ name, slug } })
      await prisma.echoTag.create({ data:{ echoId: echo.id, tagId: tag.id } }).catch(()=>{})
    }
  }

  return NextResponse.json({ echo })
}
