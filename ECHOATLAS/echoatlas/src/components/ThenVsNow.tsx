"use client";
import { useState } from "react";
export default function ThenVsNow({ thenImg, nowImg, thenYear=1998, nowYear=2024 }:{ thenImg:string, nowImg:string, thenYear?:number, nowYear?:number }){
  const [pos,setPos]=useState(50)
  return (
    <div className="relative h-[360px] rounded-xl overflow-hidden bg-black select-none group" onMouseMove={e=>{
      const r=(e.currentTarget as HTMLDivElement).getBoundingClientRect()
      setPos(((e.clientX-r.left)/r.width)*100)
    }}>
      <img src={nowImg} alt="now" className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: pos+"%" }}>
        <img src={thenImg} alt="then" className="h-full w-[100vw] max-w-none object-cover"/>
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: pos+"%"}}/>
      <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow" style={{ left: `calc(${pos}% - 16px)`}}>↔</div>
      <div className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full bg-black/70 text-white border border-white/20">THEN — {thenYear}</div>
      <div className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full bg-white text-black">NOW — {nowYear}</div>
      <input type="range" min={5} max={95} value={pos} onChange={e=> setPos(parseInt(e.target.value))} className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2/3 accent-white opacity-70 group-hover:opacity-100"/>
    </div>
  )
}
