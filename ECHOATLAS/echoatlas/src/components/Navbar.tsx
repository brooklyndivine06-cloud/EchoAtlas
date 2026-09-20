"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, MapPinned } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  useEffect(()=>{
    fetch("/api/auth/me").then(r=>r.json()).then(d=>{ if(d.user) setUser(d.user)}).catch(()=>{})
  },[])

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f1412]/80 border-b border-[#1e2e28]">
      <div className="max-w-[1420px] mx-auto px-4 md:px-6 h-[56px] flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#d6e8d0] flex items-center justify-center text-[#0f1412] font-bold text-sm">◈</div>
          <span className="font-semibold tracking-tight text-[15px]">EchoAtlas</span>
          <span className="hidden md:inline text-xs text-[#a8b5af] ml-1">Every place has a story.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-[#cbd5d1]">
          <Link href="/explore" className="hover:text-white">Explore</Link>
          <Link href="/feed" className="hover:text-white">Stories</Link>
          <Link href="/trails" className="hover:text-white">Trails</Link>
          <Link href="/explore" className="hover:text-white">Community</Link>
        </nav>

        <div className="flex-1 flex justify-center max-w-[520px] mx-auto hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8c86]"/>
            <input onKeyDown={(e)=>{
              if(e.key==='Enter'){
                const q=(e.target as HTMLInputElement).value
                if(q) window.location.href=`/explore?q=${encodeURIComponent(q)}`
              }
            }} placeholder="Search locations, stories, people…" className="w-full h-9 pl-9 pr-3 rounded-full bg-[#1a2420] border border-[#24332e] text-sm placeholder:text-[#7a8c86] focus:outline-none focus:border-[#2f453d]"/>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Link href="/create" className="hidden md:inline-flex h-8 px-4 rounded-full bg-[#d6e8d0] text-[#0f1412] text-sm font-medium items-center">Create an Echo</Link>
              <Link href={`/profile/${user.username}`} className="w-8 h-8 rounded-full overflow-hidden bg-[#1a2420] border border-[#2a3a34]">
                {user.profileImage ? <img src={user.profileImage} alt={user.username} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs">{user.username[0].toUpperCase()}</div>}
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-[#cbd5d1] hover:text-white px-3">Sign in</Link>
              <Link href="/auth/register" className="h-8 px-4 rounded-full bg-white text-[#0f1412] text-sm font-medium inline-flex items-center">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
