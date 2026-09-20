import bcrypt from "bcryptjs"
import { describe, it, expect } from "vitest"

async function hashPassword(p:string){ return bcrypt.hash(p,10) }
async function verifyPassword(p:string, h:string){ return bcrypt.compare(p,h) }

describe("auth", ()=>{
  it("hashes and verifies", async()=>{
    const h = await hashPassword("secret123")
    expect(await verifyPassword("secret123", h)).toBe(true)
    expect(await verifyPassword("wrong", h)).toBe(false)
  })
  it("rejects short passwords via zod-like check", ()=>{
    const isValid = (p:string)=> p.length>=6
    expect(isValid("123")).toBe(false)
    expect(isValid("123456")).toBe(true)
  })
})
