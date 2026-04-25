const express = require("express")
const path = require("path")
const multer = require("multer")
const fs = require("fs")

const app = express()

app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())

// إنشاء فولدر الفيديوهات لو مش موجود
const videoPath = path.join(__dirname, "public/videos")

if (!fs.existsSync(videoPath)) {
    fs.mkdirSync(videoPath, { recursive: true })
}

// رفع الفيديو
const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"public/videos")
},
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage:storage})

// رفع فيديو
app.post("/upload", upload.single("video"), (req,res)=>{
if(!req.file){
return res.status(400).json({error:"No file"})
}
res.json({file:req.file.filename})
})

// جلب الفيديوهات
app.get("/videos",(req,res)=>{

if(!fs.existsSync(videoPath)){
return res.json([])
}

fs.readdir(videoPath,(err,files)=>{

if(err){
return res.json([])
}

const videos = files.filter(f => f.endsWith(".mp4"))
res.json(videos)

})

})

// الصفحة الرئيسية
app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","home.html"))
})

app.listen(3000,()=>{
console.log("Server running on http://localhost:3000")
})
app.get("/videos",(req,res)=>{

const folder = path.join(__dirname,"public","videos")

if(!fs.existsSync(folder)){
return res.json([])
}

fs.readdir(folder,(err,files)=>{

if(err){
return res.json([])
}

const videos = files.filter(f => f.endsWith(".mp4"))

res.json(videos)

})

})
let viewers = {}

app.post("/viewers/join", (req,res)=>{
let room = req.body.room

if(!viewers[room]){
viewers[room] = 0
}

viewers[room]++

res.json({ok:true})
})

app.get("/viewers", (req,res)=>{
let room = req.query.room

res.json({
count: viewers[room] || 0
})
})
let auctions = {}

app.get("/auction", (req,res)=>{
let room = req.query.room

if(!auctions[room]){
auctions[room] = {price:0,user:"لا يوجد"}
}

res.json(auctions[room])
})

app.post("/auction", (req,res)=>{
let {room,price,user} = req.body

if(!auctions[room]){
auctions[room] = {price:0,user:""}
}

if(Number(price) > auctions[room].price){
auctions[room] = {
price:Number(price),
user:user
}
}

res.json({ok:true})
})