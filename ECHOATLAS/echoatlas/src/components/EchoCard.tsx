import Link from "next/link";
import { Heart, MessageCircle, Bookmark as BookmarkIcon, MapPin } from "lucide-react";

export default function EchoCard({ echo }: { echo:any }) {
  const img = echo.media?.[0]?.url || "https://picsum.photos/seed/echo/600/400"
  return (
    <Link href={`/echo/${echo.id}`} className="group block rounded-2xl overflow-hidden bg-[#171f1c] border border-[#1e2e28] hover:border-[#2a3a34] transition">
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt={echo.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"/>
        <div className="absolute top-3 left-3 flex gap-2">
          {echo.mood && <span className="text-[11px] px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white border border-white/10">{echo.mood}</span>}
          {echo.city && <span className="text-[11px] px-2 py-1 rounded-full bg-[#d6e8d0] text-[#0f1412] font-medium flex items-center gap-1"><MapPin className="w-3 h-3"/>{echo.city}</span>}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white text-xs">
          <span className="flex items-center gap-1"><Heart className="w-3 h-3"/> {echo._count?.likes ?? echo.likes ?? 0}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3"/> {echo._count?.comments ?? 0}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold leading-tight line-clamp-2">{echo.title}</h3>
        <p className="text-sm text-[#a8b5af] line-clamp-2 mt-1">{echo.story}</p>
        <div className="flex items-center gap-2 mt-3">
          <img src={echo.author?.profileImage || `https://i.pravatar.cc/100?u=${echo.author?.username}`} alt={echo.author?.username} className="w-6 h-6 rounded-full object-cover"/>
          <span className="text-xs text-[#cbd5d1]">{echo.author?.name || echo.author?.username}</span>
          <span className="text-xs text-[#7a8c86] ml-auto">{echo.historicalPeriod || new Date(echo.createdAt).getFullYear()}</span>
        </div>
        {echo.tags?.length>0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {echo.tags.slice(0,3).map((t:any)=>(
              <span key={t.tag?.name || t.name} className="text-[11px] px-2 py-1 rounded-full bg-[#1a2420] border border-[#24332e] text-[#a8b5af]">#{t.tag?.name || t.name}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
