"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import EchoCard from "@/components/EchoCard";

export default function TrailsPage(){
  const [echoes, setEchoes]=useState<any[]>([])
  useEffect(()=>{ fetch("/api/echoes?limit=12").then(r=>r.json()).then(d=> setEchoes(d.echoes||[])) },[])

  // Mock trail
  const trail = {
    title: "Kollam Heritage Walk",
    description: "Railway station → Old Market → Cinema → River Bridge → Childhood Home",
    stops: echoes.slice(0,5)
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-serif font-semibold">Echo Trails</h1>
      <p className="text-sm text-[#a8b5af]">Follow a sequence of Echoes as a walking route.</p>

      <div className="mt-6 rounded-2xl overflow-hidden bg-[#121916] border border-[#1e2e28] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d6e8d0] flex items-center justify-center text-[#0f1412]">◈</div>
          <div>
            <div className="font-semibold">{trail.title}</div>
            <div className="text-xs text-[#a8b5af]">{trail.stops.length} stops • ~2.4 km • 32 min walk • by Meera</div>
          </div>
          <button className="ml-auto h-9 px-5 rounded-full bg-white text-black text-sm font-medium">Follow Trail</button>
        </div>

        <div className="relative mt-8 pl-6 border-l-2 border-dashed border-[#24332e] space-y-6">
          {trail.stops.map((e:any, idx:number)=>(
            <div key={e.id} className="relative">
              <div className="absolute -left-[29px] w-6 h-6 rounded-full bg-[#1a2420] border-2 border-[#d6e8d0] flex items-center justify-center text-[10px] font-bold">{idx+1}</div>
              <Link href={`/echo/${e.id}`} className="flex gap-4 p-3 rounded-xl bg-[#1a2420] border border-[#24332e] hover:border-[#2a3a34]">
                <img src={e.media?.[0]?.url || "https://picsum.photos/seed/t/200/200"} className="w-20 h-20 rounded-lg object-cover"/>
                <div>
                  <div className="font-medium text-sm">{e.title}</div>
                  <div className="text-xs text-[#a8b5af]">{e.city} • {e.mood}</div>
                  <div className="text-xs text-[#7a8c86] mt-1 line-clamp-1">{e.story?.slice(0,80)}</div>
                </div>
              </Link>
            </div>
          ))}
          {trail.stops.length===0 && <div className="text-sm text-[#7a8c86]">No stops yet — create Echoes to build a trail.</div>}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-3">More to explore</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {echoes.slice(0,6).map(e=> <EchoCard key={e.id} echo={e}/>)}
        </div>
      </div>
    </div>
  )
}
