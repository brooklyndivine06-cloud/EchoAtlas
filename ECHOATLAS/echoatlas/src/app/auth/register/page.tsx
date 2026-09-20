"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage(){
  const router=useRouter()
  const [form,setForm]=useState({ name:"", username:"", email:"", password:""})
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false)
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setErr("")
    const r=await fetch("/api/auth/register",{ method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify(form)})
    const d=await r.json()
    if(!r.ok){ setErr(d.error||"Failed"); setLoading(false); return}
    window.location.href="/explore"
  }
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10 bg-[#0f1412]">
      <div className="w-full max-w-[440px] rounded-2xl bg-[#121916] border border-[#1e2e28] p-8">
        <h1 className="text-2xl font-serif font-semibold">Join EchoAtlas</h1>
        <p className="text-sm text-[#a8b5af] mt-1">Every place has a story. Start yours.</p>
        <form onSubmit={submit} className="space-y-3 mt-6">
          <input required value={form.name} onChange={e=> setForm({...form,name:e.target.value})} placeholder="Full name" className="w-full h-11 px-4 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
          <input required value={form.username} onChange={e=> setForm({...form,username:e.target.value})} placeholder="Username (a-z, 0-9, _)" className="w-full h-11 px-4 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
          <input required type="email" value={form.email} onChange={e=> setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-11 px-4 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
          <input required type="password" value={form.password} onChange={e=> setForm({...form,password:e.target.value})} placeholder="Password (min 6)" className="w-full h-11 px-4 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
          {err && <div className="text-sm text-red-400 bg-red-950/30 p-2 rounded-lg">{typeof err==="object"? JSON.stringify(err): err}</div>}
          <button disabled={loading} className="w-full h-11 rounded-full bg-[#d6e8d0] text-[#0f1412] font-medium">{loading?"Creating...":"Create account"}</button>
        </form>
        <div className="text-sm text-center mt-6 text-[#a8b5af]">Have an account? <Link href="/auth/login" className="text-white underline">Sign in</Link></div>
      </div>
    </div>
  )
}
