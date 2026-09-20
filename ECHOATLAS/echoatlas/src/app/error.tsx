"use client"
export default function Error({ error, reset }: { error: Error, reset: ()=>void }){
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">Unable to load stories.</h1>
      <p className="text-[#a8b5af] mt-2">Please check your connection and try again.</p>
      <p className="text-xs text-[#7a8c86] mt-2">{error.message}</p>
      <button onClick={reset} className="mt-6 h-10 px-6 rounded-full bg-[#d6e8d0] text-[#0f1412] font-medium">Try again</button>
    </div>
  )
}
