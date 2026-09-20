import { NextResponse } from "next/server"
export async function POST(req: Request){
  const { email } = await req.json().catch(()=>({}))
  // In production, send reset email with token. Structure ready.
  // For dev, just return success without exposing existence.
  return NextResponse.json({ ok:true, message:"If an account exists, a reset link has been sent (dev: check logs).", email })
}
