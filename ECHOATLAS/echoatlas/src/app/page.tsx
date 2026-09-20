"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import EchoCard from "@/components/EchoCard";
import { Compass, Shuffle, Clock, TrendingUp } from "lucide-react";

const Map = dynamic(()=>import("@/components/Map"), { ssr:false })

export default function Home() {
  const [echoes, setEchoes] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(()=>{
    fetch("/api/echoes?limit=12").then(r=>r.json()).then(d=> setEchoes(d.echoes||[]))
    fetch("/api/admin/stats").then(r=>r.json()).then(d=> setStats(d)).catch(()=> setStats({ totalUsers: 1240, totalEchoes: 3420 }))
  },[])

  const surprise = async()=>{
    if(!echoes.length) return
    const random = echoes[Math.floor(Math.random()*echoes.length)]
    window.location.href=`/echo/${random.id}`
  }

  return (
    <div className="min-h-screen bg-[#0f1412]">
      {/* Hero */}
      <section className="relative h-[560px] overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80" alt="coast" className="w-full h-full object-cover opacity-60"/>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1412] via-[#0f1412]/70 to-transparent"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1412] to-transparent"/>
        </div>
        <div className="relative max-w-[1420px] mx-auto px-6 h-full flex items-center">
          <div className="max-w-[560px]">
            <h1 className="text-[48px] md:text-[64px] font-serif leading-[0.95] tracking-tight">
              Every place<br/>has a story.
            </h1>
            <p className="mt-4 text-[15px] leading-6 text-[#cbd5d1] max-w-[420px]">
              Explore the memories, history and hidden stories attached to the world around you.
            </p>
            <div className="flex gap-3 mt-8">
              <Link href="/explore" className="h-11 px-6 rounded-full bg-white text-[#0f1412] font-medium inline-flex items-center gap-2">Explore the Map <Compass className="w-4 h-4"/></Link>
              <Link href="/create" className="h-11 px-6 rounded-full bg-[#1a2420] border border-white/10 text-white font-medium inline-flex items-center">Create an Echo</Link>
            </div>
            <div className="flex gap-6 mt-6 text-xs text-[#a8b5af]">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Real stories</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Real places</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>A more human map</span>
            </div>
          </div>

          <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-[360px]">
            <div className="rounded-2xl overflow-hidden bg-[#171f1c] border border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1526772661823-3f88f33771cd?w=600&q=80" className="h-48 w-full object-cover"/>
              <div className="p-4">
                <div className="text-xs text-[#a8b5af]">Kazhikode, Kerala</div>
                <div className="font-semibold">A Fort by the Sea</div>
                <p className="text-sm text-[#a8b5af] mt-2 leading-relaxed">“The waves haven’t changed, but everything else has.”</p>
                <div className="flex items-center gap-2 mt-3">
                  <img src="https://i.pravatar.cc/100?img=12" className="w-6 h-6 rounded-full"/>
                  <span className="text-xs">by Ananya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map preview + nearby */}
      <section className="max-w-[1420px] mx-auto px-4 md:px-6 -mt-10 relative z-10">
        <div className="grid lg:grid-cols-[1.7fr_0.9fr] gap-6">
          <div className="rounded-2xl overflow-hidden bg-[#121916] border border-[#1e2e28] p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2"><Compass className="w-4 h-4 text-[#a8b5af]"/> Explore Kerala</h3>
              <Link href="/explore" className="text-xs px-3 py-1.5 rounded-full bg-[#1a2420] border border-[#24332e]">View full map</Link>
            </div>
            <div className="h-[420px] rounded-xl overflow-hidden">
              <Map markers={echoes.slice(0,12).map(e=>({ id:e.id, title:e.title, latitude:e.latitude, longitude:e.longitude, mood:e.mood, image:e.media?.[0]?.url }))} center={[10.5,76.2]} zoom={8}/>
            </div>
          </div>

          <div className="bg-[#121916] border border-[#1e2e28] rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Nearby Stories</h3>
            <div className="space-y-3">
              {echoes.slice(0,4).map(e=>(
                <Link key={e.id} href={`/echo/${e.id}`} className="flex gap-3 p-2 rounded-xl hover:bg-[#1a2420] transition">
                  <img src={e.media?.[0]?.url || "https://picsum.photos/seed/a/200/200"} className="w-16 h-16 rounded-lg object-cover shrink-0"/>
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-tight line-clamp-1">{e.title}</div>
                    <div className="text-xs text-[#a8b5af]">{e.city} • {e.mood}</div>
                    <div className="text-xs text-[#7a8c86] mt-1">♥ {e._count?.likes||0} • 💬 {e._count?.comments||0}</div>
                  </div>
                </Link>
              ))}
            </div>
            <button onClick={surprise} className="mt-4 w-full h-10 rounded-full bg-[#d6e8d0] text-[#0f1412] font-medium flex items-center justify-center gap-2"><Shuffle className="w-4 h-4"/> Surprise Me</button>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-[1420px] mx-auto px-4 md:px-6 mt-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Trending Echoes</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-[#1a2420] border border-[#24332e] flex items-center gap-1"><TrendingUp className="w-3 h-3"/> This week</span>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {echoes.slice(0,8).map(e=> <EchoCard key={e.id} echo={e}/>)}
        </div>
        {echoes.length===0 && <div className="py-20 text-center text-[#7a8c86] border border-dashed border-[#24332e] rounded-2xl">No stories have been recorded here yet. Be the first to create an Echo.</div>}
      </section>

      {/* Then vs Now teaser */}
      <section className="max-w-[1420px] mx-auto px-4 md:px-6 mt-10 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden bg-[#171f1c] border border-[#1e2e28] p-6">
          <h3 className="font-semibold">Then vs Now</h3>
          <p className="text-sm text-[#a8b5af] mt-1">Drag to reveal how places transform through time.</p>
          <div className="relative h-56 rounded-xl overflow-hidden mt-4 bg-[#0f1412]">
            <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60"/>
            <div className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden border-r-2 border-white">
              <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" className="w-[200%] max-w-none h-full object-cover grayscale"/>
            </div>
            <div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-black/70 text-white">THEN — 1998</div>
            <div className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full bg-white text-black">NOW — 2024</div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">↔</div>
          </div>
        </div>
        <div className="rounded-2xl bg-[#d6e8d0] text-[#0f1412] p-8 flex flex-col justify-center">
          <div className="text-5xl font-serif leading-none">12.4k</div>
          <div className="text-sm opacity-70">stories preserved</div>
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div><div className="text-2xl font-semibold">3.2k</div><div className="text-xs opacity-60">places</div></div>
            <div><div className="text-2xl font-semibold">890</div><div className="text-xs opacity-60">contributors</div></div>
            <div><div className="text-2xl font-semibold">47</div><div className="text-xs opacity-60">cities</div></div>
          </div>
          <Link href="/explore" className="mt-8 h-10 rounded-full bg-[#0f1412] text-white inline-flex items-center justify-center font-medium">Start exploring</Link>
        </div>
      </section>

      <footer className="max-w-[1420px] mx-auto px-6 py-10 text-xs text-[#7a8c86] text-center">
        © 2026 EchoAtlas — Made for places that remember.
      </footer>
    </div>
  )
}
