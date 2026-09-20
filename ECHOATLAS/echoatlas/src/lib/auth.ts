import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "echoatlas-dev-secret-change-in-production-32chars")
const COOKIE_NAME = "echoatlas_session"

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(JWT_SECRET)

  const expiresAt = new Date(Date.now() + 30*24*60*60*1000)
  await prisma.session.create({ data: { userId, token, expiresAt } })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })
  return token
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(()=>{})
    cookieStore.delete(COOKIE_NAME)
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string
    const session = await prisma.session.findUnique({ where: { token } })
    if (!session || session.expiresAt < new Date()) return null
    const user = await prisma.user.findUnique({ where: { id: userId } })
    return user
  } catch {
    return null
  }
}

export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

// For API routes (not using next/headers cookies correctly in all contexts)
export async function getUserFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") || ""
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  const token = match?.[1]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string
    const session = await prisma.session.findUnique({ where: { token } })
    if (!session || session.expiresAt < new Date()) return null
    const user = await prisma.user.findUnique({ where: { id: userId } })
    return user
  } catch { return null }
}
