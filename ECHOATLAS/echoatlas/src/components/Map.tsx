"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type EchoMarker = {
  id: string
  title: string
  latitude: number
  longitude: number
  mood?: string
  image?: string
}

export default function Map({
  markers,
  center = [10.8505, 76.2711],
  zoom = 7,
  onMarkerClick,
  onMapClick,
  height = "100%",
  selectedId,
}:{
  markers: EchoMarker[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (id:string)=>void
  onMapClick?: (lat:number,lng:number)=>void
  height?: string
  selectedId?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  useEffect(()=>{
    if(!ref.current || mapRef.current) return
    const map = L.map(ref.current, { zoomControl: false }).setView(center, zoom)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: "bottomright"}).addTo(map)
    if (onMapClick) {
      map.on("click", (e:any)=> onMapClick(e.latlng.lat, e.latlng.lng))
    }
    mapRef.current = map
    markersRef.current = L.layerGroup().addTo(map)
    return ()=> { map.remove(); mapRef.current=null }
  },[])

  useEffect(()=>{
    if(!mapRef.current) return
    mapRef.current.setView(center, zoom)
  },[center[0], center[1], zoom])

  useEffect(()=>{
    if(!markersRef.current || !mapRef.current) return
    markersRef.current.clearLayers()
    markers.forEach(m=>{
      const isSelected = m.id===selectedId
      const el = document.createElement("div")
      el.innerHTML = `
        <div style="width:${isSelected?44:36}px;height:${isSelected?44:36}px;border-radius:9999px;overflow:hidden;border:2px solid ${isSelected?"#d6e8d0":"white"};box-shadow:0 4px 12px rgba(0,0,0,0.4);background:#1a2420;display:flex;align-items:center;justify-content:center">
          ${m.image?`<img src="${m.image}" style="width:100%;height:100%;object-fit:cover"/>`:`<span style="font-size:10px;color:#d6e8d0">●</span>`}
        </div>
      `
      const icon = L.divIcon({ html: el, className: "", iconSize: [36,36], iconAnchor:[18,18] })
      const marker = L.marker([m.latitude, m.longitude], { icon })
      marker.on("click", ()=> onMarkerClick?.(m.id))
      marker.bindPopup(`<b>${m.title}</b><br/><span style="font-size:12px">${m.mood||""}</span>`)
      markersRef.current!.addLayer(marker)
    })

    // simple clustering: if many markers close, we already show individually but Leaflet default is fine for MVP
  },[markers, selectedId])

  return <div ref={ref} style={{ height, width:"100%", borderRadius:16, overflow:"hidden"}} />
}
