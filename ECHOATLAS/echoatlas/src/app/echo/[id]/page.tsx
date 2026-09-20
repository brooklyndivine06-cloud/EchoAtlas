"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Heart, MessageCircle, Bookmark, Share2, MapPin, Calendar, Flag, Eye } from "lucide-react";

const Map = dynamic(()=>import("@/components/Map"), { ssr:false });

function ThenVsNow({ thenImg, nowImg }: { thenImg:string, nowImg:string }){
  const [pos, setPos]=useState(50)
  return (
    <div className="relative h-[320px] rounded-xl overflow-hidden bg-black select-none" onMouseMove={e=>{
      const rect=(e.currentTarget as HTMLDivElement).getBoundingClientRect()
      const x= ((e.clientX-rect.left)/rect.width)*100
      setPos(Math.max(5,Math.min(95,x)))
    }} onTouchMove={e=>{
      const rect=(e.currentTarget as HTMLDivElement).getBoundingClientRect()
      const x= ((e.touches[0].clientX-rect.left)/rect.width)*100
      setPos(Math.max(5,Math.min(95,x)))
    }}>
      <img src={nowImg} className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0 overflow-hidden" style={{ width:`${pos}%`}}>
        <img src={thenImg} className="w-[100vw] max-w-none h-full object-cover" style={{ width:`calc(100vw)` }}/>
      </div>
      <div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-black/70 text-white">THEN — 1998</div>
      <div className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full bg-white text-black">NOW — 2024</div>
      <div className="absolute top-0 bottom-0 w-[2px] bg-white" style={{ left:`${pos}%`}}/>
      <div className="absolute top-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center -translate-y-1/2 shadow" style={{ left:`calc(${pos}% - 16px)`}}>↔</div>
      <input type="range" min={5} max={95} value={pos} onChange={e=> setPos(parseInt(e.target.value))} className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2/3 accent-white"/>
    </div>
  )
}

export default function EchoDetail(){
  const { id } = useParams() as { id:string }
  const [data, setData] = useState<any>(null)
  const [liked, setLiked]=useState(false)
  const [bookmarked, setBookmarked]=useState(false)
  const [following, setFollowing]=useState(false)
  const [comment, setComment]=useState("")
  const [showReport, setShowReport]=useState(false)

  const load = ()=>{
    fetch(`/api/echoes/${id}`).then(r=>r.json()).then(d=>{
      setData(d.echo); setLiked(d.liked); setBookmarked(d.bookmarked); setFollowing(d.isFollowing)
    })
  }
  useEffect(load,[id])

  const toggleLike = async()=>{
    setLiked(!liked)
    const r=await fetch(`/api/echoes/${id}/like`,{ method:"POST"})
    const d=await r.json()
    setLiked(d.liked)
    load()
  }
  const toggleBookmark = async()=>{
    const r=await fetch(`/api/echoes/${id}/bookmark`,{ method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({}) })
    const d=await r.json()
    setBookmarked(d.bookmarked)
  }
  const toggleFollow = async()=>{
    if(!data) return
    await fetch(`/api/users/${data.authorId}/follow`,{ method:"POST"})
    setFollowing(!following)
  }
  const postComment = async()=>{
    if(!comment.trim()) return
    await fetch(`/api/echoes/${id}/comments`,{ method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ content: comment }) })
    setComment("")
    load()
  }

  if(!data) return <div className="max-w-[980px] mx-auto px-6 py-20 text-center text-[#7a8c86]">Loading story…</div>

  const hero = data.media?.[0]?.url || "https://picsum.photos/seed/hero/1200/600"

  return (
    <div className="bg-[#0f1412] min-h-screen">
      {/* Hero */}
      <div className="relative h-[420px] overflow-hidden">
        <img src={hero} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1412] via-[#0f1412]/40 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-[1100px] mx-auto">
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-[#d6e8d0] text-[#0f1412] font-medium">{data.mood}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-black/50 backdrop-blur text-white border border-white/10 flex items-center gap-1"><MapPin className="w-3 h-3"/> {data.city}, {data.country||"India"} • {data.approximateYear || new Date(data.date||data.createdAt).getFullYear()}</span>
          </div>
          <h1 className="text-[32px] md:text-[40px] font-serif leading-tight text-white max-w-[720px]">{data.title}</h1>
          <div className="flex items-center gap-3 mt-4">
            <img src={data.author?.profileImage || `https://i.pravatar.cc/100?u=${data.author?.username}`} className="w-10 h-10 rounded-full border-2 border-white/20"/>
            <div>
              <Link href={`/profile/${data.author?.username}`} className="text-white font-medium text-sm hover:underline">{data.author?.name}</Link>
              <div className="text-xs text-white/70">@{data.author?.username} • {new Date(data.createdAt).toLocaleDateString()}</div>
            </div>
            <button onClick={toggleFollow} className={`ml-4 h-8 px-4 rounded-full text-xs font-medium ${following?"bg-white text-black":"bg-white/10 backdrop-blur text-white border border-white/20"}`}>{following?"Following":"Follow"}</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8 grid lg:grid-cols-[1.6fr_0.9fr] gap-8">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 text-sm border-b border-[#1e2e28] pb-4">
            <button onClick={toggleLike} className={`h-9 px-4 rounded-full flex items-center gap-2 border ${liked?"bg-[#d6e8d0] text-[#0f1412] border-[#d6e8d0]":"bg-[#1a2420] border-[#24332e] text-white"}`}><Heart className={`w-4 h-4 ${liked?"fill-current":""}`}/> {data._count?.likes||0} {liked?"Liked":"Like"}</button>
            <button className="h-9 px-4 rounded-full bg-[#1a2420] border border-[#24332e] flex items-center gap-2"><MessageCircle className="w-4 h-4"/> {data._count?.comments||0} Comment</button>
            <button onClick={toggleBookmark} className={`h-9 px-4 rounded-full flex items-center gap-1 border ${bookmarked?"bg-white text-black border-white":"bg-[#1a2420] border-[#24332e]"}`}><Bookmark className={`w-4 h-4 ${bookmarked?"fill-current":""}`}/> {bookmarked?"Saved":"Save"}</button>
            <button className="h-9 w-9 rounded-full bg-[#1a2420] border border-[#24332e] flex items-center justify-center ml-auto"><Share2 className="w-4 h-4"/></button>
            <button onClick={()=> setShowReport(!showReport)} className="h-9 w-9 rounded-full bg-[#1a2420] border border-[#24332e] flex items-center justify-center"><Flag className="w-4 h-4"/></button>
          </div>

          {showReport && (
            <div className="mt-4 p-4 rounded-xl bg-[#1a2420] border border-[#24332e]">
              <div className="text-sm font-medium">Report this Echo</div>
              <div className="flex gap-2 mt-2">
                {["Spam","False information","Inappropriate","Other"].map(r=>(
                  <button key={r} onClick={async()=>{ await fetch("/api/reports",{ method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ echoId:data.id, reason:r }) }); alert("Reported"); setShowReport(false)}} className="text-xs px-3 py-1.5 rounded-full bg-[#0f1412] border border-[#24332e]">{r}</button>
                ))}
              </div>
            </div>
          )}

          <article className="prose prose-invert prose-sm max-w-none mt-6 leading-relaxed text-[#cbd5d1]">
            <p className="whitespace-pre-wrap text-[15px] leading-7">{data.story}</p>
          </article>

          {data.media?.length>1 && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              {data.media.slice(1).map((m:any,i:number)=> <img key={i} src={m.url} className="h-32 w-full object-cover rounded-xl border border-[#1e2e28]"/>)}
            </div>
          )}

          {/* Audio */}
          {data.media?.some((m:any)=> m.type==="audio") && (
            <div className="mt-6 p-4 rounded-xl bg-[#1a2420] border border-[#24332e] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#d6e8d0] flex items-center justify-center text-[#0f1412]">▶</div>
              <div className="flex-1">
                <div className="text-sm font-medium">Audio Story</div>
                <div className="h-1.5 bg-[#24332e] rounded-full mt-2 overflow-hidden"><div className="h-full w-1/3 bg-[#d6e8d0]"/></div>
              </div>
              <audio controls src={data.media.find((m:any)=> m.type==="audio")?.url} className="w-48"/>
            </div>
          )}

          {/* Then vs Now */}
          {data.thenVsNow ? (
            <div className="mt-8">
              <h3 className="font-semibold mb-3">Then vs Now</h3>
              <ThenVsNow thenImg={data.thenVsNow.thenImage} nowImg={data.thenVsNow.nowImage}/>
            </div>
          ) : (
            <div className="mt-8">
              <h3 className="font-semibold mb-3">Then vs Now — Example</h3>
              <ThenVsNow thenImg="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" nowImg="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"/>
              <p className="text-xs text-[#7a8c86] mt-2">This Echo doesn’t have a comparison yet. Upload one when you create your own.</p>
            </div>
          )}

          {data.tags?.length>0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {data.tags.map((t:any)=> <span key={t.tag.id} className="text-xs px-3 py-1.5 rounded-full bg-[#1a2420] border border-[#24332e] text-[#a8b5af]">#{t.tag.name}</span>)}
            </div>
          )}

          {/* Comments */}
          <div className="mt-10 border-t border-[#1e2e28] pt-6">
            <h3 className="font-semibold flex items-center gap-2">Comments ({data.comments?.length||0}) <span className="text-xs text-[#7a8c86]">Related Echoes · Then vs Now · Location</span></h3>
            <div className="flex gap-3 mt-4">
              <img src={`https://i.pravatar.cc/100?u=me`} className="w-8 h-8 rounded-full"/>
              <div className="flex-1 flex gap-2">
                <input value={comment} onChange={e=> setComment(e.target.value)} placeholder="Write a comment..." className="flex-1 h-10 px-4 rounded-full bg-[#1a2420] border border-[#24332e] text-sm focus:outline-none"/>
                <button onClick={postComment} className="h-10 px-5 rounded-full bg-white text-black font-medium text-sm">Post</button>
              </div>
            </div>
            <div className="space-y-4 mt-6">
              {data.comments?.map((c:any)=>(
                <div key={c.id} className="flex gap-3">
                  <img src={c.user.profileImage||`https://i.pravatar.cc/100?u=${c.user.username}`} className="w-8 h-8 rounded-full"/>
                  <div className="flex-1 bg-[#121916] border border-[#1e2e28] rounded-2xl px-4 py-3">
                    <div className="text-sm font-medium">{c.user.name} <span className="text-xs text-[#7a8c86]">@{c.user.username} • {new Date(c.createdAt).toLocaleDateString()}</span></div>
                    <p className="text-sm text-[#cbd5d1] mt-1">{c.content}</p>
                  </div>
                </div>
              ))}
              {(!data.comments || data.comments.length===0) && <div className="text-sm text-[#7a8c86] py-6 text-center border border-dashed border-[#24332e] rounded-xl">No comments yet. Share your perspective.</div>}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl overflow-hidden bg-[#121916] border border-[#1e2e28]">
            <div className="h-48">
              <Map markers={[{ id:data.id, title:data.title, latitude:data.latitude, longitude:data.longitude, image:data.media?.[0]?.url }]} center={[data.latitude, data.longitude]} zoom={13} height="100%"/>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#a8b5af] flex items-center gap-1"><MapPin className="w-3 h-3"/> {data.address || `${data.city}, ${data.country}`}</div>
              <div className="text-sm font-medium mt-1">{data.city}, Kerala</div>
              <div className="flex gap-3 text-xs text-[#7a8c86] mt-2"><span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {data.approximateYear || new Date(data.createdAt).getFullYear()}</span><span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {data.viewCount||0} views</span></div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#121916] border border-[#1e2e28] p-4">
            <h4 className="font-semibold text-sm">About the author</h4>
            <div className="flex items-center gap-3 mt-3">
              <img src={data.author?.profileImage || `https://i.pravatar.cc/100?u=${data.author?.username}`} className="w-12 h-12 rounded-full"/>
              <div>
                <div className="text-sm font-medium">{data.author?.name}</div>
                <div className="text-xs text-[#a8b5af]">@{data.author?.username}</div>
              </div>
            </div>
            <p className="text-sm text-[#a8b5af] mt-3">{data.author?.bio||"Documenting forgotten places and everyday wonders."}</p>
            <Link href={`/profile/${data.author?.username}`} className="mt-4 h-9 rounded-full bg-white text-black text-sm font-medium flex items-center justify-center">View profile</Link>
          </div>

          <div className="rounded-2xl bg-[#d6e8d0] text-[#0f1412] p-5">
            <h4 className="font-semibold">Discover more</h4>
            <p className="text-sm opacity-70 mt-1">Nearby Echoes within 12km</p>
            <Link href="/explore" className="mt-4 h-9 rounded-full bg-[#0f1412] text-white text-sm flex items-center justify-center">Explore nearby</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
