"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import EchoCard from "@/components/EchoCard";

const Map = dynamic(()=>import("@/components/Map"), { ssr:false });

export default function ProfilePage(){
  const { username } = useParams() as { username:string }
  const [profile, setProfile]=useState<any>(null)
  const [echoes, setEchoes]=useState<any[]>([])
  const [tab, setTab]=useState("Echoes")
  const [me, setMe]=useState<any>(null)
  const [isFollowing, setIsFollowing]=useState(false)

  useEffect(()=>{
    fetch("/api/auth/me").then(r=>r.json()).then(d=> setMe(d.user))
  },[])

  const load = async()=>{
    // fetch profile via search api fallback, or direct via explore need user api
    // we have no /api/users route yet, so search for user then load echoes
    const res = await fetch(`/api/search?q=${username}`)
    const data = await res.json()
    let user = data.users?.find((u:any)=> u.username===username)
    // if username is "me", use me
    if(username==="me" && me) user = me
    if(!user && me?.username===username) user = me
    if(!user){
      // try to fetch echoes by author via search of stories? fallback to show me
      if(me) { setProfile(me); }
    } else {
      // fetch full profile via API that returns user+stats
      const uRes = await fetch(`/api/users/${user.id}/follow`).then(r=>r.json()).catch(()=>null)
      setProfile({ ...user, followers: uRes?.followers||0, following: uRes?.following||0 })
      setIsFollowing(uRes?.isFollowing||false)
      // echoes for that user
      const eRes = await fetch(`/api/echoes?limit=100`).then(r=>r.json())
      const filtered = (eRes.echoes||[]).filter((e:any)=> e.author.username===user.username)
      setEchoes(filtered)
    }
    // if profile still null, fallback to me
    if(!user && me){
      const eRes = await fetch(`/api/echoes?limit=100`).then(r=>r.json())
      const filtered = (eRes.echoes||[]).filter((e:any)=> e.author.username===me.username)
      setProfile({ ...me, followers:0, following:0 })
      setEchoes(filtered)
    }
  }
  useEffect(()=>{ load() },[username, me])

  const follow = async()=>{
    if(!profile) return
    const r = await fetch(`/api/users/${profile.id||username}/follow`, { method:"POST"})
    const d=await r.json()
    setIsFollowing(d.following)
  }

  if(!profile) return <div className="max-w-[1100px] mx-auto px-6 py-20 text-center text-[#7a8c86]">Loading profile…</div>

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6">
      {/* cover */}
      <div className="rounded-2xl overflow-hidden bg-[#121916] border border-[#1e2e28]">
        <div className="h-44 relative">
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
        </div>
        <div className="px-6 pb-6">
          <div className="flex gap-4 -mt-10 relative">
            <img src={profile.profileImage || `https://i.pravatar.cc/200?u=${profile.username}`} className="w-24 h-24 rounded-full border-4 border-[#121916] object-cover bg-[#1a2420]"/>
            <div className="flex-1 pt-10">
              <h1 className="text-xl font-semibold">{profile.name}</h1>
              <div className="text-sm text-[#a8b5af]">@{profile.username} • {profile.location||"Thiruvananthapuram"} • Joined Jan 2023</div>
              <p className="text-sm text-[#cbd5d1] mt-2 max-w-[560px]">{profile.bio||"Stories, places and people. Kerala — Travel — Architecture"}</p>
              <div className="flex gap-4 text-sm mt-3"><span><b>{echoes.length}</b> Echoes</span><span><b>{profile.followers||0}</b> Followers</span><span><b>{profile.following||0}</b> Following</span></div>
            </div>
            <div className="pt-10 hidden md:block">
              {me?.username!==profile.username ? (
                <button onClick={follow} className={`h-9 px-6 rounded-full font-medium text-sm ${isFollowing?"bg-white text-black":"bg-[#d6e8d0] text-[#0f1412]"}`}>{isFollowing?"Following":"Follow"}</button>
              ) : (
                <Link href="#" className="h-9 px-6 rounded-full bg-[#1a2420] border border-[#24332e] flex items-center text-sm">Edit profile</Link>
              )}
            </div>
          </div>

          <div className="flex gap-6 mt-6 border-b border-[#1e2e28]">
            {["Echoes","Map","Saved","Tagged"].map(t=>(
              <button key={t} onClick={()=> setTab(t)} className={`pb-3 text-sm border-b-2 ${tab===t?"border-white text-white":"border-transparent text-[#7a8c86]"}`}>{t}</button>
            ))}
          </div>

          {tab==="Echoes" && (
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {echoes.map(e=> <EchoCard key={e.id} echo={e}/>)}
              {echoes.length===0 && <div className="col-span-3 py-12 text-center text-[#7a8c86] border border-dashed border-[#24332e] rounded-xl">No Echoes yet. The map is waiting.</div>}
            </div>
          )}
          {tab==="Map" && (
            <div className="h-[420px] rounded-xl overflow-hidden mt-6 border border-[#24332e]">
              <Map markers={echoes.map(e=>({ id:e.id, title:e.title, latitude:e.latitude, longitude:e.longitude, image:e.media?.[0]?.url }))} center={echoes[0]? [echoes[0].latitude, echoes[0].longitude]:[10.5,76.2]} zoom={8} height="100%"/>
            </div>
          )}
          {tab==="Saved" && <div className="py-12 text-center text-[#7a8c86] border border-dashed border-[#24332e] rounded-xl mt-6">Your saved places are waiting for you.</div>}
        </div>
      </div>
    </div>
  )
}
