import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: Request){
  const user = await getUserFromRequest(req)
  if(!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const notifications = await prisma.notification.findMany({ where:{ userId:user.id }, orderBy:{ createdAt:"desc" }, take:50 })
  return NextResponse.json({ notifications })
}

export async function PATCH(req: Request){
  const user = await getUserFromRequest(req)
  if(!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const body = await req.json().catch(()=>({}))
  if(body.markAllRead){
    await prisma.notification.updateMany({ where:{ userId:user.id, read:false }, data:{ read:true } })
  } else if(body.id){
    await prisma.notification.update({ where:{ id: body.id }, data:{ read:true } })
  }
  return NextResponse.json({ ok:true })
}
