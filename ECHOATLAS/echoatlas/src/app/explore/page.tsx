"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, Heart, MessageCircle } from "lucide-react";

const Map = dynamic(()=>import("@/components/Map"), { ssr:false });

const filters = ["All","Historical","Food","Travel","College","Architecture","Nature","Personal","Mystery","Events"]

export default function ExplorePage(){
  const [echoes, setEchoes] = useState<any[]>([])
  const [active, setActive] = useState("All")
  const [q, setQ] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [year, setYear] = useState(2026)
  const [searchResults, setSearchResults] = useState<any>(null)

  const fetchEchoes = ()=>{
    const params = new URLSearchParams()
    if(q) params.set("q", q)
    if(active!=="All") params.set("tag", active)
    if(year!==2026) params.set("year", String(year))
    fetch(`/api/echoes?${params.toString()}`).then(r=>r.json()).then(d=> setEchoes(d.echoes||[]))
  }
  useEffect(fetchEchoes, [active, year])
  useEffect(()=>{
    const t = setTimeout(fetchEchoes, 400)
    return ()=> clearTimeout(t)
  },[q])

  const filtered = echoes // already filtered server side

  const selectedEcho = filtered.find(e=> e.id===selected)

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col md:flex-row bg-[#0f1412]">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex w-[340px] shrink-0 flex-col border-r border-[#1e2e28] bg-[#0f1412]">
        <div className="p-4 border-b border-[#1e2e28]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8c86]"/>
            <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search locations, stories, people…" className="w-full h-10 pl-9 pr-3 rounded-full bg-[#1a2420] border border-[#24332e] text-sm focus:outline-none"/>
          </div>
          <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-1">
            {filters.map(f=>(
              <button key={f} onClick={()=> setActive(f)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${active===f ? "bg-white text-black border-white" : "bg-[#1a2420] text-[#a8b5af] border-[#24332e]"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="p-3 border-b border-[#1e2e28] flex items-center justify-between">
          <h3 className="font-semibold text-sm">Nearby Stories • {filtered.length}</h3>
          <button className="p-1.5 rounded-lg bg-[#1a2420] border border-[#24332e]"><SlidersHorizontal className="w-4 h-4"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filtered.map(e=>(
            <div key={e.id} onClick={()=> setSelected(e.id)} className={`rounded-xl overflow-hidden border cursor-pointer ${selected===e.id ? "border-[#d6e8d0] bg-[#1a2420]" : "border-[#1e2e28] bg-[#171f1c] hover:border-[#24332e]"}`}>
              <div className="flex gap-3 p-3">
                <img src={e.media?.[0]?.url || "https://picsum.photos/seed/1/200/200"} className="w-20 h-20 rounded-lg object-cover"/>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-tight line-clamp-2">{e.title}</div>
                  <div className="text-xs text-[#a8b5af] mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {e.city || e.address || "Kerala, India"}</div>
                  <div className="flex items-center gap-3 text-xs text-[#7a8c86] mt-2"><span className="flex items-center gap-1"><Heart className="w-3 h-3"/> {e._count?.likes||0}</span><span className="flex items-center gap-1"><MessageCircle className="w-3 h-3"/> {e._count?.comments||0}</span></div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="py-10 text-center text-sm text-[#7a8c86]">No stories found. Try another filter.</div>}
        </div>

        {/* Time travel */}
        <div className="p-4 border-t border-[#1e2e28] bg-[#121916]">
          <div className="flex items-center justify-between text-xs"><span className="font-medium flex items-center gap-1">⏳ Time Travel</span><span className="px-2 py-1 rounded-full bg-[#d6e8d0] text-[#0f1412] font-bold">{year}</span></div>
          <input type="range" min={1950} max={2026} value={year} onChange={e=> setYear(parseInt(e.target.value))} className="w-full mt-3 accent-[#d6e8d0]"/>
          <div className="flex justify-between text-[10px] text-[#7a8c86]"><span>1950</span><span>2026</span></div>
          <p className="text-[11px] text-[#a8b5af] mt-2">Slide to filter stories by year — watch the map change.</p>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative bg-[#0a0f0e]">
        {/* mobile search */}
        <div className="md:hidden absolute top-3 left-3 right-3 z-[400] flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8c86]"/>
            <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search here..." className="w-full h-10 pl-9 pr-3 rounded-full bg-[#0f1412]/90 backdrop-blur border border-white/10 text-sm"/>
          </div>
        </div>
        <div className="md:hidden absolute top-[56px] left-3 right-3 z-[400] flex gap-1.5 overflow-x-auto scrollbar-none">
          {filters.slice(0,5).map(f=>(
            <button key={f} onClick={()=> setActive(f)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${active===f ? "bg-white text-black" : "bg-[#0f1412]/80 text-white border border-white/10"}`}>{f}</button>
          ))}
        </div>

        <div className="absolute inset-0">
          <Map markers={filtered.map(e=>({ id:e.id, title:e.title, latitude:e.latitude, longitude:e.longitude, image:e.media?.[0]?.url, mood:e.mood }))} selectedId={selected||undefined} onMarkerClick={setSelected} center={[10.5,76.2]} zoom={8} height="100%"/>
        </div>

        {/* selected card */}
        {selectedEcho && (
          <div className="absolute bottom-4 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:w-[520px] z-[400]">
            <div className="rounded-2xl overflow-hidden bg-[#171f1c] border border-white/10 shadow-2xl flex">
              <img src={selectedEcho.media?.[0]?.url || "https://picsum.photos/seed/a/400/300"} className="w-32 md:w-40 object-cover"/>
              <div className="p-4 flex-1 min-w-0">
                <div className="text-xs text-[#a8b5af] flex items-center gap-1"><MapPin className="w-3 h-3"/> {selectedEcho.city} • {selectedEcho.mood}</div>
                <div className="font-semibold leading-tight mt-1 line-clamp-2">{selectedEcho.title}</div>
                <p className="text-sm text-[#a8b5af] line-clamp-2 mt-1">{selectedEcho.story?.slice(0,120)}</p>
                <div className="flex gap-2 mt-3">
                  <Link href={`/echo/${selectedEcho.id}`} className="h-8 px-4 rounded-full bg-white text-black text-sm font-medium inline-flex items-center">Open story</Link>
                  <button onClick={()=> setSelected(null)} className="h-8 px-3 rounded-full bg-[#1a2420] border border-white/10 text-sm">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom sheet for nearby - show when not selected */}
      <div className="md:hidden max-h-[45vh] overflow-y-auto bg-[#0f1412] border-t border-[#1e2e28] p-3">
        <div className="w-10 h-1 rounded-full bg-[#24332e] mx-auto mb-3"/>
        <h3 className="font-semibold text-sm mb-2">Nearby • {filtered.length}</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filtered.slice(0,8).map(e=>(
            <Link key={e.id} href={`/echo/${e.id}`} className="shrink-0 w-64 rounded-xl overflow-hidden bg-[#171f1c] border border-[#1e2e28]">
              <img src={e.media?.[0]?.url || "https://picsum.photos/seed/x/400/300"} className="h-32 w-full object-cover"/>
              <div className="p-3">
                <div className="text-sm font-medium line-clamp-1">{e.title}</div>
                <div className="text-xs text-[#a8b5af]">{e.city}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
