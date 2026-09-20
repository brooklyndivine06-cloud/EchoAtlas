"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const Map = dynamic(()=>import("@/components/Map"), { ssr:false });

const moods = ["Happy","Nostalgic","Peaceful","Mysterious","Sad","Exciting","Melancholic","Inspiring","Other"]
const visibilities = ["Public","Followers only","Private"]

export default function CreatePage(){
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<any>({
    title:"", story:"", mood:"Nostalgic", tags:"", historicalPeriod:"",
    latitude:10.8505, longitude:76.2711, address:"Kochi, Kerala", city:"Kochi", country:"India",
    date:"", approximateYear:"", visibility:"Public",
  })
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [thenImage, setThenImage] = useState<File | null>(null)
  const [nowImage, setNowImage] = useState<File | null>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const files = Array.from(e.target.files||[])
    setMediaFiles(prev=> [...prev, ...files])
    files.forEach(f=>{
      const url = URL.createObjectURL(f)
      setPreviewUrls(prev=> [...prev, url])
    })
  }

  const submit = async()=>{
    setLoading(true)
    try {
      // upload media first
      let media:any[]=[]
      if (mediaFiles.length>0){
        const fd = new FormData()
        mediaFiles.forEach(f=> fd.append("files", f))
        const r = await fetch("/api/upload", { method:"POST", body: fd })
        const d = await r.json()
        if (d.urls) media = d.urls.map((u:string)=> ({ url:u, type:"image" }))
      }
      // handle then/now if present
      let thenVsNow = null
      if (thenImage && nowImage){
        const fd2 = new FormData()
        fd2.append("files", thenImage); fd2.append("files", nowImage)
        const r2 = await fetch("/api/upload", { method:"POST", body: fd2 })
        const d2 = await r2.json()
        if(d2.urls?.length===2){
          thenVsNow = { thenImage: d2.urls[0], nowImage: d2.urls[1], thenYear: parseInt(form.approximateYear)||1998, nowYear: 2026 }
        }
      }

      const payload = {
        title: form.title,
        story: form.story,
        mood: form.mood,
        tags: form.tags.split(",").map((s:string)=>s.trim()).filter(Boolean),
        historicalPeriod: form.historicalPeriod,
        latitude: form.latitude,
        longitude: form.longitude,
        address: form.address,
        city: form.city,
        country: form.country,
        date: form.date || null,
        approximateYear: form.approximateYear || null,
        visibility: form.visibility,
        media,
      }
      const res = await fetch("/api/echoes", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error||"Failed")
      // if thenVsNow, create comparison via extra call (simplified: store via echo update - we will create entry directly via prisma? For MVP, just redirect)
      router.push(`/echo/${data.echo.id}`)
    } catch(e:any){
      alert(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-[980px] mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-semibold">Create an Echo</h1>
        <p className="text-sm text-[#a8b5af]">Document a place before its story fades.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {[1,2,3,4,5,6].map(n=>(
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step===n ? "bg-[#d6e8d0] text-[#0f1412]" : step>n ? "bg-[#1a2420] border border-[#d6e8d0] text-[#d6e8d0]" : "bg-[#1a2420] border border-[#24332e] text-[#7a8c86]"}`}>{n}</div>
            <span className={`text-xs hidden md:inline ${step===n ? "text-white" : "text-[#7a8c86]"}`}>{["Story","Location","Media","Date","Visibility","Review"][n-1]}</span>
            {n<6 && <div className="w-6 h-[1px] bg-[#24332e]"/>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="rounded-2xl bg-[#121916] border border-[#1e2e28] p-6">
          {step===1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Tell your story</h3>
              <div>
                <label className="text-xs text-[#a8b5af]">Title</label>
                <input value={form.title} onChange={e=> setForm({...form, title:e.target.value})} placeholder="Give your story a title..." className="w-full mt-1 h-10 px-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm focus:outline-none"/>
              </div>
              <div>
                <label className="text-xs text-[#a8b5af]">Your story</label>
                <textarea value={form.story} onChange={e=> setForm({...form, story:e.target.value})} placeholder="Share your memories, observations or reflections..." rows={6} className="w-full mt-1 p-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm focus:outline-none"/>
              </div>
              <div>
                <label className="text-xs text-[#a8b5af]">Mood</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {moods.map(m=>(
                    <button key={m} onClick={()=> setForm({...form, mood:m})} className={`px-3 py-1.5 rounded-full text-xs border ${form.mood===m ? "bg-[#d6e8d0] text-[#0f1412] border-[#d6e8d0]" : "bg-[#1a2420] border-[#24332e] text-[#a8b5af]"}`}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#a8b5af]">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e=> setForm({...form, tags:e.target.value})} placeholder="Kerala, Nostalgic, Cinema..." className="w-full mt-1 h-10 px-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
                </div>
                <div>
                  <label className="text-xs text-[#a8b5af]">Historical period (optional)</label>
                  <input value={form.historicalPeriod} onChange={e=> setForm({...form, historicalPeriod:e.target.value})} placeholder="e.g., Post-independence" className="w-full mt-1 h-10 px-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
                </div>
              </div>
            </div>
          )}

          {step===2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Where did this happen?</h3>
              <p className="text-xs text-[#a8b5af]">Click on the map or drag the marker. Search is simulated.</p>
              <div className="h-[320px] rounded-xl overflow-hidden border border-[#24332e]">
                <Map markers={[{ id:"temp", title:form.title||"Your Echo", latitude:form.latitude, longitude:form.longitude }]} center={[form.latitude, form.longitude]} zoom={10} onMapClick={(lat,lng)=> setForm({...form, latitude:lat, longitude:lng})} height="100%"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.address} onChange={e=> setForm({...form, address:e.target.value})} placeholder="Address" className="h-10 px-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
                <input value={form.city} onChange={e=> setForm({...form, city:e.target.value})} placeholder="City" className="h-10 px-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
                <input value={form.country} onChange={e=> setForm({...form, country:e.target.value})} placeholder="Country" className="h-10 px-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
                <div className="text-xs text-[#7a8c86] flex items-center px-3">{form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</div>
              </div>
            </div>
          )}

          {step===3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Add photos, video or audio</h3>
              <div className="border-2 border-dashed border-[#24332e] rounded-xl p-6 text-center bg-[#1a2420]/50">
                <input type="file" multiple accept="image/*,video/*,audio/*" onChange={handleFiles} className="hidden" id="file-upload"/>
                <label htmlFor="file-upload" className="cursor-pointer h-10 px-5 rounded-full bg-white text-black inline-flex items-center font-medium text-sm">Choose files</label>
                <p className="text-xs text-[#7a8c86] mt-2">JPG, PNG, WEBP, MP4, MP3/WAV up to 8MB each</p>
              </div>
              {previewUrls.length>0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previewUrls.map((u,i)=> <img key={i} src={u} className="h-24 w-full object-cover rounded-lg border border-[#24332e]"/>)}
                </div>
              )}
              <div className="pt-4 border-t border-[#1e2e28]">
                <h4 className="text-sm font-medium">Then vs Now (optional)</h4>
                <p className="text-xs text-[#a8b5af]">Upload an old and a current photo of the same place.</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <label className="h-28 rounded-xl border border-dashed border-[#24332e] flex flex-col items-center justify-center cursor-pointer bg-[#1a2420]">
                    <input type="file" accept="image/*" className="hidden" onChange={e=> setThenImage(e.target.files?.[0]||null)}/>
                    <span className="text-xs">{thenImage? thenImage.name : "THEN — upload old photo"}</span>
                  </label>
                  <label className="h-28 rounded-xl border border-dashed border-[#24332e] flex flex-col items-center justify-center cursor-pointer bg-[#1a2420]">
                    <input type="file" accept="image/*" className="hidden" onChange={e=> setNowImage(e.target.files?.[0]||null)}/>
                    <span className="text-xs">{nowImage? nowImage.name : "NOW — upload current photo"}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step===4 && (
            <div className="space-y-4">
              <h3 className="font-semibold">When did this happen?</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#a8b5af]">Exact date</label>
                  <input type="date" value={form.date} onChange={e=> setForm({...form, date:e.target.value})} className="w-full mt-1 h-10 px-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
                </div>
                <div>
                  <label className="text-xs text-[#a8b5af]">Approximate year</label>
                  <input type="number" value={form.approximateYear} onChange={e=> setForm({...form, approximateYear:e.target.value})} placeholder="1998" className="w-full mt-1 h-10 px-3 rounded-xl bg-[#1a2420] border border-[#24332e] text-sm"/>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#1a2420] border border-[#24332e]">
                <div className="text-xs font-medium">Time Travel preview</div>
                <input type="range" min={1950} max={2026} value={parseInt(form.approximateYear)||2026} onChange={e=> setForm({...form, approximateYear:e.target.value})} className="w-full mt-2 accent-[#d6e8d0]"/>
                <div className="flex justify-between text-[10px] text-[#7a8c86]"><span>1950</span><span>2026</span></div>
              </div>
            </div>
          )}

          {step===5 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Who can see this?</h3>
              <div className="space-y-2">
                {visibilities.map(v=>(
                  <label key={v} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${form.visibility===v?"border-[#d6e8d0] bg-[#1a2420]":"border-[#24332e] bg-[#1a2420]/50"}`}>
                    <input type="radio" checked={form.visibility===v} onChange={()=> setForm({...form, visibility:v})} className="accent-[#d6e8d0]"/>
                    <div><div className="text-sm font-medium">{v}</div><div className="text-xs text-[#a8b5af]">{v==="Public"?"Anyone can discover": v==="Followers only"?"Only your followers": "Only you"}</div></div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step===6 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Preview</h3>
              <div className="rounded-xl overflow-hidden bg-[#1a2420] border border-[#24332e]">
                {previewUrls[0] && <img src={previewUrls[0]} className="h-56 w-full object-cover"/>}
                <div className="p-4">
                  <div className="text-xs text-[#a8b5af]">{form.city} • {form.mood}</div>
                  <div className="font-semibold text-lg mt-1">{form.title || "Untitled Echo"}</div>
                  <p className="text-sm text-[#cbd5d1] mt-2 whitespace-pre-wrap">{form.story || "Your story will appear here."}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {form.tags.split(",").filter(Boolean).map((t:string)=> <span key={t} className="text-xs px-2 py-1 rounded-full bg-[#0f1412] border border-[#24332e]">#{t.trim()}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button onClick={()=> setStep(s=> Math.max(1,s-1))} disabled={step===1} className="h-10 px-5 rounded-full bg-[#1a2420] border border-[#24332e] text-sm disabled:opacity-50">Back</button>
            {step<6 ? <button onClick={()=> setStep(s=> s+1)} className="h-10 px-6 rounded-full bg-white text-black font-medium">Next →</button> : <button onClick={submit} disabled={loading} className="h-10 px-6 rounded-full bg-[#d6e8d0] text-[#0f1412] font-medium disabled:opacity-50">{loading?"Publishing...":"Publish Echo"}</button>}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="rounded-2xl bg-[#d6e8d0] text-[#0f1412] p-6">
            <h4 className="font-semibold">Tips for a great Echo</h4>
            <ul className="text-sm mt-3 space-y-2 opacity-80 list-disc pl-4">
              <li>Be specific — name the street, shop, or corner.</li>
              <li>Add an old photo if you have one.</li>
              <li>Include sounds, smells, small details.</li>
              <li>Choose a mood that matches the memory.</li>
            </ul>
            <div className="mt-6 p-3 rounded-xl bg-black/10 text-xs">Your Echo will appear on the map instantly and be discoverable via Time Travel.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
