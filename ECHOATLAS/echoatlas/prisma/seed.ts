import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

const cities = [
  { city:"Kochi", country:"India", lat:9.9312, lng:76.2673 },
  { city:"Thiruvananthapuram", country:"India", lat:8.5241, lng:76.9366 },
  { city:"Kollam", country:"India", lat:8.8932, lng:76.6141 },
  { city:"Alappuzha", country:"India", lat:9.4981, lng:76.3388 },
  { city:"Kozhikode", country:"India", lat:11.2588, lng:75.7804 },
  { city:"Munnar", country:"India", lat:10.0889, lng:77.0595 },
  { city:"Fort Kochi", country:"India", lat:9.9658, lng:76.2424 },
  { city:"Varkala", country:"India", lat:8.7379, lng:76.7163 },
  { city:"Kumarakom", country:"India", lat:9.6170, lng:76.4300 },
  { city:"Wayanad", country:"India", lat:11.6854, lng:76.1320 },
  { city:"Paris", country:"France", lat:48.8566, lng:2.3522 },
  { city:"Kyoto", country:"Japan", lat:35.0116, lng:135.7681 },
  { city:"Lisbon", country:"Portugal", lat:38.7223, lng:-9.1393 },
  { city:"New York", country:"USA", lat:40.7128, lng:-74.0060 },
  { city:"Bangkok", country:"Thailand", lat:13.7563, lng:100.5018 },
]

const moods = ["Happy","Nostalgic","Peaceful","Mysterious","Sad","Exciting","Melancholic","Inspiring","Other"]
const tagsPool = ["Historical","Food","Travel","College","Architecture","Nature","Personal","Mystery","Events","Kerala","Monsoon","Railway","Cinema","Temple","Beach","Street","Market"]
const titles = [
  "The Last Cinema in My Town", "A Fort by the Sea", "Monsoon Evenings at the Backwaters", "College Days at Kowdiar", "A Railway Memory",
  "The Old Lighthouse", "Varkala Cliffs at Dawn", "The Bus Stop That Never Changed", "Childhood at the Temple Pond", "The Abandoned Market of Kollam",
  "Tea and Rain in Munnar", "The House by the Canal", "Alappuzha Boat Stories", "The Street That Sings", "Echoes of Fort Kochi",
  "Where the Fishermen Sing", "The Playground After School", "The Café Near the Station", "Kumarakom: Before the Resorts", "Wayanad Mist",
  "The Library That Saved Me", "Night Train to Thiruvananthapuram", "The Temple Festival", "The Corner Shop of My Youth", "A Different Kochi",
  "The Bridge That Connects Us", "The Church on the Hill", "My Grandmother's Kitchen", "The Beach at 5am", "Lost and Found in Kyoto",
  "Paris in the Rain", "Lisbon Tram 28", "New York Subway Stories", "Bangkok Floating Market"
]

const stories = [
  "It was more than just a cinema. It was where friendships were forged, where we saw the world beyond our town, where every Friday felt like a festival. The velvet seats are gone now, but the smell of popcorn still lives in my memory.",
  "The waves haven't changed, but everything else has. The fort stands as it did centuries ago, watching fishermen and freighters, lovers and loners. I come here when I need to remember that some things endure.",
  "Monsoon evenings here have a rhythm. The rain on the tiles, the canal rising, the kettles whistling in every home. We would sit on the verandah and watch the world blur into grey and green.",
  "Kowdiar in the 90s was different — fewer cars, more bicycles, and that one bakery that made puffs like no other. College was less about classes and more about the long walks under the rain trees.",
  "The railway station was my window to the world. Every departure announced a future, every arrival a reunion. The chai still tastes the same, but the faces have changed.",
  "This lighthouse has guided ships and stories. I climbed it as a child and thought I could see the edge of the world. Now I bring my own children, and they think the same.",
  "Varkala cliffs at dawn — the light cuts through the sea mist, the temple bells begin, and the ocean is still deciding whether to be calm or wild. It's the best time to be alone without being lonely.",
  "Some bus stops are just bus stops. This one was our office, our living room, our parliament. We solved the world's problems there between 5 and 7 pm, waiting for buses that were always late.",
]

async function main(){
  console.log("Seeding EchoAtlas...")
  await prisma.bookmark.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.like.deleteMany()
  await prisma.echoTag.deleteMany()
  await prisma.echoMedia.deleteMany()
  await prisma.trailStop.deleteMany()
  await prisma.trail.deleteMany()
  await prisma.historicalComparison.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.report.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.echo.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash("password123", 10)
  const adminHash = await bcrypt.hash("admin123", 10)

  // create users
  const users:any[]=[]
  const names = ["Arun Mathew","Meera Nair","Ananya Krishnan","Rahul Thomas","Nimisha","Vikram S","Lakshmi P","Sofia Almeida","Kenji Tanaka","Elena Silva","James Carter","Aisha Khan","Dev Patel","Maya George","Harish Kumar","Sneha Rao","Tara Menon","Arjun Pillai","Fatima Sheikh","Noah Lee","Yuki Sato","Clara Dupont","Marco Rossi","Priya Nair","Samuel O","Lina Bo","Zara Ali","Kiran Das","Amara Okafor","Leo Zhang"]
  for(let i=0;i<30;i++){
    const name = names[i]
    const username = name.toLowerCase().replace(/\s+/g,'') + (i>0? String(i):"")
    const email = i===0 ? "admin@echoatlas.com" : `${username}@example.com`
    const hash = i===0? adminHash : passwordHash
    const isAdmin = i===0
    const user = await prisma.user.create({
      data:{
        name, username, email, passwordHash: hash, isAdmin,
        bio: ["Documenting forgotten places and everyday wonders.", "Kerala — Travel — Architecture", "Collector of street stories", "Photographer of monsoon light"][i%4],
        location: cities[i % cities.length].city + ", " + cities[i % cities.length].country,
        profileImage: `https://i.pravatar.cc/200?img=${(i%70)+1}`,
      }
    })
    users.push(user)
  }

  // create tags
  const tagMap = new Map<string, any>()
  for(const t of tagsPool){
    const slug=t.toLowerCase()
    const tag = await prisma.tag.create({ data:{ name:t, slug } })
    tagMap.set(t, tag)
  }

  // create echoes
  const echoes:any[]=[]
  for(let i=0;i<100;i++){
    const city = cities[i % cities.length]
    const title = titles[i % titles.length] + (i> titles.length ? ` — ${city.city}`:"")
    const story = stories[i % stories.length] + " " + stories[(i+3)%stories.length].slice(0,120)
    const mood = moods[i%moods.length]
    const author = users[i % users.length]
    const latJitter = (Math.random()-0.5)*0.5
    const lngJitter = (Math.random()-0.5)*0.5
    const year = 1960 + Math.floor(Math.random()*64) // 1960-2024
    const date = new Date(year, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1)
    const imageSeed = 10 + (i%90)
    const imageUrl = `https://picsum.photos/seed/echo${i}/800/600`
    // random city image fallback
    const echo = await prisma.echo.create({
      data:{
        title,
        story,
        mood,
        historicalPeriod: year < 1980 ? "Post-independence" : year < 2000 ? "Liberalisation era" : "Contemporary",
        latitude: city.lat + latJitter,
        longitude: city.lng + lngJitter,
        address: `${city.city} Centre`,
        city: city.city,
        country: city.country,
        date,
        approximateYear: year,
        visibility: Math.random()>0.9 ? "Private" : "Public",
        authorId: author.id,
        viewCount: Math.floor(Math.random()*3200),
      }
    })
    // media
    await prisma.echoMedia.create({ data:{ echoId: echo.id, url: imageUrl, type:"image" } })
    if(Math.random()>0.7){
      await prisma.echoMedia.create({ data:{ echoId: echo.id, url: `https://picsum.photos/seed/extra${i}/800/600`, type:"image" } })
    }
    if(Math.random()>0.85){
      await prisma.echoMedia.create({ data:{ echoId: echo.id, url: `/uploads/sample.mp3`, type:"audio" } })
    }
    // tags
    const shuffled = [...tagsPool].sort(()=>0.5-Math.random())
    const chosen = shuffled.slice(0, 2 + Math.floor(Math.random()*3))
    for(const ct of chosen){
      const tag = tagMap.get(ct)
      await prisma.echoTag.create({ data:{ echoId: echo.id, tagId: tag.id } }).catch(()=>{})
    }
    // then vs now for some
    if(i%7===0){
      await prisma.historicalComparison.create({
        data: {
          echoId: echo.id,
          thenImage: `https://picsum.photos/seed/then${i}/800/600`,
          nowImage: `https://picsum.photos/seed/now${i}/800/600`,
          thenYear: year,
          nowYear: 2024,
        }
      }).catch(()=>{})
    }
    echoes.push(echo)
  }

  // likes 100
  for(let i=0;i<150;i++){
    const user = users[Math.floor(Math.random()*users.length)]
    const echo = echoes[Math.floor(Math.random()*echoes.length)]
    await prisma.like.create({ data:{ userId:user.id, echoId:echo.id } }).catch(()=>{})
  }
  // comments 150
  for(let i=0;i<150;i++){
    const user = users[Math.floor(Math.random()*users.length)]
    const echo = echoes[Math.floor(Math.random()*echoes.length)]
    const contents = [
      "I remember watching my first movie here! Brings back so many memories ❤️",
      "Beautifully written! This place still has the same charm.",
      "My grandmother used to tell me stories about this place.",
      "We used to play here every evening after school.",
      "The description is so vivid I can smell the rain.",
      "Thank you for preserving this memory.",
      "This is exactly how I remember it in 1998.",
      "Have you been back recently? So much has changed.",
    ]
    await prisma.comment.create({
      data:{ userId:user.id, echoId:echo.id, content: contents[i % contents.length] }
    })
  }
  // follows
  for(let i=0;i<60;i++){
    const a = users[Math.floor(Math.random()*users.length)]
    const b = users[Math.floor(Math.random()*users.length)]
    if(a.id===b.id) continue
    await prisma.follow.create({ data:{ followerId:a.id, followingId:b.id } }).catch(()=>{})
  }
  // bookmarks / collections
  for(let i=0;i<10;i++){
    const user = users[i]
    const col = await prisma.collection.create({ data:{ userId:user.id, name: ["Places I Want To Visit","Kerala Memories","Architecture","Research","Personal"][i%5] } })
    const sampleEchoes = echoes.slice(i*3, i*3+3)
    for(const e of sampleEchoes){
      await prisma.bookmark.create({ data:{ userId:user.id, echoId:e.id, collectionId:col.id } }).catch(()=>{})
    }
  }
  // trails
  const trail = await prisma.trail.create({ data:{ title:"Kollam Heritage Walk", description:"Railway Station → Old Market → Cinema → River Bridge → Childhood Home", userId: users[1].id } })
  for(let i=0;i<5;i++){
    await prisma.trailStop.create({ data:{ trailId: trail.id, echoId: echoes[i].id, order:i } })
  }

  // notifications example
  await prisma.notification.create({
    data:{ userId: users[0].id, actorId: users[1].id, type:"like", title:`${users[1].name} liked your Echo`, body:"The Old Lighthouse" }
  })

  console.log(`Seeded ${users.length} users, ${echoes.length} echoes`)
}

main().then(()=> prisma.$disconnect()).catch(e=>{ console.error(e); prisma.$disconnect(); process.exit(1)})
