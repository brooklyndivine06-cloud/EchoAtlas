"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage(){
  const [stats, setStats]=useState<any>(null)
  const [reports, setReports]=useState<any[]>([])
  const [echoes, setEchoes]=useState<any[]>([])
  const [users, setUsers]=useState<any[]>([])
  const [error, setError]=useState("")

  useEffect(()=>{
    fetch("/api/admin/stats").then(async r=>{
      if(!r.ok){ setError("Admin access required — login as admin@echoatlas.com / admin123"); return}
      const d=await r.json(); setStats(d)
    })
    fetch("/api/reports").then(r=> r.json()).then(d=> setReports(d.reports||[])).catch(()=>{})
    fetch("/api/echoes?limit=20").then(r=> r.json()).then(d=> setEchoes(d.echoes||[]))
    fetch("/api/search?q=a").then(r=> r.json()).then(d=> setUsers(d.users||[]))
  },[])

  if(error) return <div className="max-w-[980px] mx-auto px-6 py-20"><div className="p-6 rounded-xl bg-red-950/30 border border-red-900 text-red-200">{error}<br/><Link href="/auth/login" className="underline">Sign in</Link></div></div>
  if(!stats) return <div className="max-w-[980px] mx-auto px-6 py-20 text-center text-[#7a8c86]">Loading admin…</div>

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="text-sm text-[#a8b5af]">Moderation, analytics and content management.</p>

      <div className="grid md:grid-cols-4 gap-4 mt-6">
        {[
          { label:"Total users", value: stats.totalUsers },
          { label:"Total Echoes", value: stats.totalEchoes },
          { label:"Echoes today", value: stats.echoesToday },
          { label:"Pending reports", value: stats.totalReports },
        ].map(s=>(
          <div key={s.label} className="rounded-2xl bg-[#121916] border border-[#1e2e28] p-5">
            <div className="text-xs text-[#a8b5af]">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl bg-[#121916] border border-[#1e2e28] p-5">
          <h3 className="font-semibold">Most active cities</h3>
          <div className="space-y-2 mt-3">
            {(stats.topCities||[]).map((c:any)=>(
              <div key={c.city} className="flex items-center justify-between p-2 rounded-lg bg-[#1a2420] border border-[#24332e] text-sm"><span>{c.city||"Unknown"}</span><span className="font-mono">{c._count.city}</span></div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-[#121916] border border-[#1e2e28] p-5">
          <h3 className="font-semibold">Recent Echoes</h3>
          <div className="space-y-2 mt-3">
            {(stats.recentEchoes||[]).map((e:any)=>(
              <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-[#1a2420] border border-[#24332e] text-sm"><span className="truncate">{e.title}</span><span className="text-xs text-[#7a8c86]">{e.author?.username}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-[#121916] border border-[#1e2e28] overflow-hidden">
        <div className="p-4 border-b border-[#1e2e28] flex items-center justify-between"><h3 className="font-semibold">Reports</h3><span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">{reports.length} total</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[#7a8c86] bg-[#0f1412]"><tr><th className="text-left p-3">Reason</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th className="text-left p-3">Action</th></tr></thead>
            <tbody>
              {reports.map((r:any)=>(
                <tr key={r.id} className="border-t border-[#1e2e28]"><td className="p-3">{r.reason}</td><td className="p-3"><span className="px-2 py-1 rounded-full bg-[#1a2420] border border-[#24332e] text-xs">{r.status}</span></td><td className="p-3 text-xs text-[#7a8c86]">{new Date(r.createdAt).toLocaleDateString()}</td><td className="p-3"><button className="text-xs underline">Review</button></td></tr>
              ))}
              {reports.length===0 && <tr><td colSpan={4} className="p-6 text-center text-[#7a8c86]">No reports.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-[#121916] border border-[#1e2e28] overflow-hidden">
        <div className="p-4 border-b border-[#1e2e28]"><h3 className="font-semibold">Echoes</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[#7a8c86] bg-[#0f1412]"><tr><th className="text-left p-3">Title</th><th className="text-left p-3">Author</th><th className="text-left p-3">City</th><th className="text-left p-3">Actions</th></tr></thead>
            <tbody>
              {echoes.map((e:any)=>(
                <tr key={e.id} className="border-t border-[#1e2e28]"><td className="p-3 truncate max-w-[320px]">{e.title}</td><td className="p-3">{e.author?.username}</td><td className="p-3">{e.city}</td><td className="p-3 flex gap-2"><Link href={`/echo/${e.id}`} className="text-xs px-2 py-1 rounded-full bg-[#1a2420] border border-[#24332e]">View</Link><button onClick={async()=>{ if(confirm("Delete?")){ await fetch(`/api/echoes/${e.id}`,{ method:"DELETE"}); location.reload() }}} className="text-xs px-2 py-1 rounded-full bg-red-950/50 border border-red-900 text-red-300">Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
