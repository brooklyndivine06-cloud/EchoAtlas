import { rankScore, trendingScore } from "../src/lib/ranking"
import { describe, it, expect } from "vitest"

describe("ranking", () => {
  it("scores newer highly engaged nearby echo higher", () => {
    const base = { id:"1", createdAt:new Date(), latitude:10, longitude:76, likeCount:10, commentCount:5, storyLength:800, mediaCount:2, tags:["Kerala"] }
    const old = { ...base, id:"2", createdAt:new Date(Date.now()-60*24*3600*1000), likeCount:1, commentCount:0 }
    expect(rankScore(base as any, { userLat:10, userLon:76 })).toBeGreaterThan(rankScore(old as any, { userLat:10, userLon:76 }))
  })
  it("trending decays with age", ()=>{
    const fresh = { id:"1", createdAt:new Date(Date.now()-2*3600*1000), latitude:10, longitude:76, likeCount:20, commentCount:10, storyLength:500, mediaCount:1, tags:[] }
    const aged = { ...fresh, id:"2", createdAt:new Date(Date.now()-200*3600*1000)}
    expect(trendingScore(fresh as any)).toBeGreaterThan(trendingScore(aged as any))
  })
})
