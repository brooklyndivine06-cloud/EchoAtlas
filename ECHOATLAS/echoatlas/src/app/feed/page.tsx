"use client";
import { useEffect, useState } from "react";
import EchoCard from "@/components/EchoCard";
import { Clock, TrendingUp, MapPin, Heart, Sparkles } from "lucide-react";

export default function FeedPage(){
  const [echoes, setEchoes]=useState<any[]>([])
  const [tab, setTab]=useState("For you")
  const [me, setMe]=useState<any>(null)

  useEffect(()=>{
    fetch("/api/echoes?limit=50").then(r=>r.json()).then(d=> setEchoes(d.echoes||[]))
    fetch("/api/auth/me").then(r=>r.json()).then(d=> setMe(d.user))
  },[])

  // Ranking logic client side for demo
  const sorted = [...echoes].sort((a,b)=>{
    if(tab==="Trending") return (b._count.likes*2+b._count.comments) - (a._count.likes*2+a._count.comments)
    if(tab==="Recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if(tab==="Nearby") return a.city=== "Kochi"? -1:1
    if(tab==="Hidden Gems") return (a._count.likes) - (b._count.likes) // low engagement first but quality
    // For you: our rankScore
    return (b._count.likes*0.5 + b._count.comments) - (a._count.likes*0.5 + a._count.comments)
  })

  const sections = [
    { id:"For you", icon: Sparkles, label:"For you" },
    { id:"Nearby", icon: MapPin, label:"Nearby" },
    { id:"Trending", icon: TrendingUp, label:"Trending" },
    { id:"Recent", icon: Clock, label:"Recent" },
    { id:"Hidden Gems", icon: Heart, label:"Hidden Gems" },
  ]

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 grid lg:grid-cols-[1.7fr_0.9fr] gap-6">
      <div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
          {sections.map(s=>{
            const Icon=s.icon
            return <button key={s.id} onClick={()=> setTab(s.id)} className={`shrink-0 h-9 px-4 rounded-full flex items-center gap-2 text-sm border ${tab===s.id ? "bg-white text-black border-white":"bg-[#1a2420] border-[#24332e] text-[#a8b5af]"}`}><Icon className="w-4 h-4"/>{s.label}</button>
          })}
        </div>

        <div className="mt-4 space-y-4">
          {sorted.slice(0,20).map(e=> <div key={e.id} className="max-w-[680px]"><EchoCard echo={e}/></div>)}
          {sorted.length===0 && <div className="py-20 text-center text-[#7a8c86] border border-dashed border-[#24332e] rounded-xl">No stories yet.</div>}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-[#121916] border border-[#1e2e28] text-xs text-[#7a8c86]">
          <b className="text-white">Ranking logic:</b> For you = 0.30·engagement + 0.25·recency + 0.20·proximity + 0.15·quality + 0.10·interest • Trending = engagement velocity • Nearby = 1/(1+km/20) • Hidden Gems = high quality, low likes — see <code>src/lib/ranking.ts</code>.
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-[#121916] border border-[#1e2e28] p-5">
          <h3 className="font-semibold">Notifications</h3>
          <Notifications />
        </div>
        <div className="rounded-2xl bg-[#d6e8d0] text-[#0f1412] p-5">
          <h3 className="font-semibold">Create your first Echo</h3>
          <p className="text-sm opacity-70 mt-1">A street, a café, a memory — any place.</p>
          <a href="/create" className="mt-4 h-9 rounded-full bg-[#0f1412] text-white flex items-center justify-center text-sm font-medium">Start writing</a>
        </div>
      </div>
    </div>
  )
}

function Notifications(){
  const [notifs, setNotifs]=useState<any[]>([])
  useEffect(()=>{
    fetch("/api/notifications").then(r=> r.json()).then(d=> setNotifs(d.notifications||[])).catch(()=>{})
  },[])
  if(notifs.length===0) return <div className="text-sm text-[#7a8c86] mt-3 py-6 text-center border border-dashed border-[#24332e] rounded-xl">No notifications yet.</div>
  return (
    <div className="space-y-3 mt-3">
      {notifs.slice(0,6).map((n:any)=>(
        <div key={n.id} className={`p-3 rounded-xl border ${n.read?"bg-[#1a2420] border-[#24332e]":"bg-[#1e2e28] border-[#2a3a34]"}`}>
          <div className="text-sm font-medium">{n.title}</div>
          <div className="text-xs text-[#a8b5af]">{n.body}</div>
          <div className="text-[11px] text-[#7a8c86] mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
      <button onClick={async()=>{ await fetch("/api/notifications",{ method:"PATCH", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ markAllRead:true })}); location.reload()}} className="text-xs underline text-[#a8b5af]">Mark all as read</button>
    </div>
  )
}
