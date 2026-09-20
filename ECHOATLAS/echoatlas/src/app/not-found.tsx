import Link from "next/link"
export default function NotFound(){
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl">◈</div>
      <h1 className="text-3xl font-serif mt-4">Place not found</h1>
      <p className="text-[#a8b5af] mt-2 max-w-[420px]">The story you’re looking for doesn’t exist — or it was never written. This neighborhood still has secrets.</p>
      <Link href="/explore" className="mt-6 h-10 px-6 rounded-full bg-white text-black font-medium inline-flex items-center">Explore the map</Link>
    </div>
  )
}
