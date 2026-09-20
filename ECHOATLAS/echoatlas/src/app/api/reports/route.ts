import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request){
  const user = await getUserFromRequest(req)
  if(!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const { echoId, reason, description } = await req.json()
  if(!reason) return NextResponse.json({ error:"Reason required" },{ status:400 })
  const report = await prisma.report.create({ data:{ reporterId:user.id, echoId, reason, description } })
  return NextResponse.json({ report })
}
export async function GET(req: Request){
  const user = await getUserFromRequest(req)
  if(!user || !user.isAdmin) return NextResponse.json({ error:"Forbidden" },{ status:403 })
  const reports = await prisma.report.findMany({ orderBy:{ createdAt:"desc" }, take:50 })
  return NextResponse.json({ reports })
}
