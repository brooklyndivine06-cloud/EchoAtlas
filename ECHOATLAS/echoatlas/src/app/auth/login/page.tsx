"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage(){
  const router = useRouter()
  const [form, setForm] = useState({ email:"", password:"" })
  const [err, setErr]=useState("")
  const [loading, setLoading]=useState(false)
  const submit = async(e:React.FormEvent)=>{
    e.preventDefault()
    setLoading(true); setErr("")
    const r = await fetch("/api/auth/login", { method:"POST", headers:{ "Content-Type":"application/json"}, body: JSON.stringify(form)})
    const d = await r.json()
    if(!r.ok){ setErr(d.error); setLoading(false); return}
    router.push("/explore"); window.location.href="/explore"
  }
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10 bg-[#0f1412]">
      <div className="w-full max-w-[420px] rounded-2xl bg-[#121916] border border-[#1e2e28] p-8">
        <h1 className="text-2xl font-serif font-semibold">Welcome back</h1>
        <p className="text-sm text-[#a8b5af] mt-1">Sign in to continue your atlas.</p>
        <form onSubmit={submit} className="space-y-4 mt-6">
          <input type="email" required value={form.email} onChange={e=> setForm({...form, email:e.target.value})} placeholder="Email" className="w-full h-11 px-4 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm focus:outline-none"/>
          <input type="password" required value={form.password} onChange={e=> setForm({...form, password:e.target.value})} placeholder="Password" className="w-full h-11 px-4 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm focus:outline-none"/>
          {err && <div className="text-sm text-red-400 bg-red-950/30 p-2 rounded-lg">{err}</div>}
          <button disabled={loading} className="w-full h-11 rounded-full bg-white text-black font-medium">{loading?"Signing in...":"Sign in"}</button>
        </form>
        <div className="text-sm text-center mt-6 text-[#a8b5af]">No account? <Link href="/auth/register" className="text-white underline">Create one</Link></div>
        <div className="mt-6 p-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-xs text-[#a8b5af]">
          Demo admin: admin@echoatlas.com / admin123<br/>
          Or register a new account.
        </div>
      </div>
    </div>
  )
}
