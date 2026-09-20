import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: Request){
  const user = await getUserFromRequest(req)
  if(!user || !user.isAdmin) return NextResponse.json({ error:"Forbidden" },{ status:403 })
  const [totalUsers, totalEchoes, totalComments, totalReports, echoesToday, likesToday] = await Promise.all([
    prisma.user.count(),
    prisma.echo.count(),
    prisma.comment.count(),
    prisma.report.count({ where:{ status:"pending" } }),
    prisma.echo.count({ where:{ createdAt:{ gte: new Date(Date.now()-24*60*60*1000) } } }),
    prisma.like.count({ where:{ createdAt:{ gte: new Date(Date.now()-24*60*60*1000) } } }),
  ])
  const activeUsers = await prisma.session.count({ where:{ expiresAt:{ gt: new Date() } } })
  const topCities = await prisma.echo.groupBy({ by:["city"], _count:{ city:true }, orderBy:{ _count:{ city:"desc" } }, take:5 })
  const recentEchoes = await prisma.echo.findMany({ orderBy:{ createdAt:"desc" }, take:5, include:{ author:{ select:{ username:true } } } })
  return NextResponse.json({ totalUsers, totalEchoes, totalComments, totalReports, echoesToday, likesToday, activeUsers, topCities, recentEchoes })
}
