import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request){
  const user = await getUserFromRequest(req)
  if(!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 })
  const form = await req.formData()
  const files = form.getAll("files") as File[]
  const single = form.get("file") as File | null
  const allFiles = files.length ? files : single ? [single] : []
  if(allFiles.length===0) return NextResponse.json({ error:"No file" },{ status:400 })

  const urls: string[] = []
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadDir, { recursive:true })

  for(const file of allFiles){
    if(file.size > 8*1024*1024) continue // 8MB limit
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","video/mp4","audio/mpeg","audio/wav","audio/mp3","audio/webm"]
    if(!allowed.includes(file.type) && !file.type.startsWith("image/")) continue
    const ext = path.extname(file.name) || (file.type.includes("png")?".png":".jpg")
    const name = `${randomUUID()}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, name), buffer)
    urls.push(`/uploads/${name}`)
  }
  return NextResponse.json({ urls })
}
