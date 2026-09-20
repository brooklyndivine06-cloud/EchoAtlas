/**
 * EchoAtlas Ranking Algorithm
 * ---------------------------
 * Used for discovery feed: combines distance, recency, engagement, quality signals and user interests.
 *
 * Score = w1*recency + w2*engagement + w3*proximity + w4*quality + w5*interestMatch
 *
 * - recency: exponential decay based on days since creation (half-life ~30 days)
 * - engagement: log-scaled likes+comments+bookmarks, normalized
 * - proximity: inverse distance if user location known (1 / (1 + km))
 * - quality: story length + media count + tags (proxy for effort)
 * - interestMatch: overlap between echo tags and user liked tags (if available)
 *
 * Trending: engagement velocity (engagement / ageInHours)
 * Recent: pure recency
 * Nearby: proximity weight dominant
 * Hidden Gems: high quality but low engagement
 */

export function haversineKm(lat1:number, lon1:number, lat2:number, lon2:number) {
  const R=6371
  const dLat=(lat2-lat1)*Math.PI/180
  const dLon=(lon2-lon1)*Math.PI/180
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return 2*R*Math.asin(Math.sqrt(a))
}

export type EchoForRanking = {
  id: string
  createdAt: Date
  latitude: number
  longitude: number
  likeCount: number
  commentCount: number
  bookmarkCount?: number
  storyLength: number
  mediaCount: number
  tags: string[]
}

export function rankScore(echo: EchoForRanking, opts?: {
  userLat?: number
  userLon?: number
  userInterests?: string[]
}) {
  const ageDays = (Date.now() - new Date(echo.createdAt).getTime())/ (1000*60*60*24)
  const recency = Math.exp(-ageDays/30) // 0..1
  const engagementRaw = echo.likeCount*2 + echo.commentCount*3 + (echo.bookmarkCount||0)*2
  const engagement = Math.log10(engagementRaw + 1)/3 // approx 0..1
  let proximity = 0.5 // neutral if no location
  if (opts?.userLat !== undefined && opts?.userLon !== undefined) {
    const km = haversineKm(opts.userLat, opts.userLon, echo.latitude, echo.longitude)
    proximity = 1/(1+ km/20) // 20km half
  }
  const quality = Math.min(1, (echo.storyLength/800 + echo.mediaCount*0.2 + echo.tags.length*0.1))
  let interestMatch = 0
  if (opts?.userInterests?.length) {
    const overlap = echo.tags.filter(t=> opts.userInterests!.includes(t)).length
    interestMatch = overlap / Math.max(1, echo.tags.length)
  }
  // weights
  const w = { recency:0.25, engagement:0.30, proximity:0.20, quality:0.15, interest:0.10 }
  return w.recency*recency + w.engagement*engagement + w.proximity*proximity + w.quality*quality + w.interest*interestMatch
}

export function trendingScore(echo: EchoForRanking) {
  const ageHours = Math.max(1, (Date.now()- new Date(echo.createdAt).getTime())/(1000*60*60))
  return (echo.likeCount*2 + echo.commentCount*3) / Math.log(ageHours + 2)
}
