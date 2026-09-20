"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Plus, Bookmark, User, Map } from "lucide-react";

const items = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/create", label: "Create", icon: Plus },
  { href: "/feed", label: "Saved", icon: Bookmark },
  { href: "/profile/me", label: "Profile", icon: User },
]

export default function MobileNav(){
  const path = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f1412] border-t border-[#1e2e28] flex items-center justify-around h-[64px] px-2">
      {items.map(it=>{
        const active = path === it.href
        const Icon = it.icon
        return (
          <Link key={it.href} href={it.href} className={`flex flex-col items-center gap-1 text-xs ${active ? "text-white" : "text-[#7a8c86]"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? "bg-[#d6e8d0] text-[#0f1412]" : "bg-transparent"}`}>
              <Icon className="w-4 h-4"/>
            </div>
            {it.label}
          </Link>
        )
      })}
    </nav>
  )
}
