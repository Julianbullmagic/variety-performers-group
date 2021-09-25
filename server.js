const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors  = require('cors')
const path = require('path')
const axios = require('axios');
const compress = require( 'compression')
const helmet = require( 'helmet')
const userRoutes = require( './routes/user.routes')
const authRoutes = require( './routes/auth.routes')
const postRoutes = require( './routes/post.routes')
const groupsRoutes = require( './routes/groups.routes')
const rulesRoutes = require( './routes/rules.routes')
const purchasesRoutes = require( './routes/purchases.routes')
const eventsRoutes = require( './routes/events.routes')
const pollRoutes = require( './routes/polls.routes')
const leadRoutes = require( './routes/lead.routes')
const fileUpload = require('express-fileupload');
const multer=require('multer')
const { Chat } = require("./models/Chat");
const { auth } = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const fs = require("fs");
var cron = require('node-cron');
const User = require("./models/user.model");
const Rule = require("./models/rule.model");
const Event = require("./models/event.model");
const Restriction = require("./models/restriction.model");

var geodist = require('geodist')





//comment out before building for production
const PORT = process.env.PORT || 5000

const app = express();
const server = require("http").createServer(app);


const io = require("socket.io")(server);



app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
app.use(cookieParser());

app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*")
  res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept")
  next();
})


const connect = mongoose
  .connect(process.env.DATABASE, { useNewUrlParser: true })
  .then(() => console.log("connected to mongodb"))
  .catch(err => console.log(err));


// mount routes
app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', postRoutes)
app.use('/groups', groupsRoutes)
app.use('/rules', rulesRoutes)
app.use('/events', eventsRoutes)
app.use('/purchases', purchasesRoutes)
app.use('/posts',postRoutes)
app.use('/leads', leadRoutes)
app.use('/polls', pollRoutes)



app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));



cron.schedule('0 0 0 * * *', () => {

  (async function(){
    var restrictions=await Restriction.find().exec()
console.log(restrictions)
var d = new Date();
var n = d.getTime();
console.log(n)
for (let rest of restrictions){
  let durationinmilli=rest.duration*86400000
  let timesincecreation=n-rest.timecreated
  if (timesincecreation>durationinmilli){
    Restriction.findByIdAndDelete(rest._id)
    .exec()

    User.findByIdAndUpdate(rest.usertorestrict, {$pull : {
    restrictions:rest._id
    }}).exec(function(err,docs){
      if(err){
              console.log(err);
          }else{

            console.log(docs)
    }
     })
  }
}

  })()
 })


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  },
  // fileFilter: (req, file, cb) => {
  //   const ext = path.extname(file.originalname)
  //   if (ext !== '.jpg' && ext !== '.png' && ext !== '.mp4') {
  //     return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
  //   }
  //   cb(null, true)
  // }
})

var upload = multer({ storage: storage }).single("file")

app.post("/api/chat/uploadfiles", auth ,(req, res) => {
  upload(req, res, err => {
    if(err) {
      return res.json({ success: false, err })
    }
    return res.json({ success: true, url: res.req.file.path });
  })
});

io.on("connection", socket => {

  socket.on("Input Chat Message", msg => {

    connect.then(db => {
      try {
        console.log("message",msg)
        if(msg.recipient){
          var chat = new Chat({ message: msg.chatMessage, sender:msg.userId, type: msg.type,recipient:msg.recipient })
        }else{
          var chat = new Chat({ message: msg.chatMessage,groupId:msg.groupId, sender:msg.userId, type: msg.type })
        }


console.log("chat",chat)
          chat.save((err, doc) => {
            console.log("error",err)
            console.log(doc)
            if(err) return res.json({ success: false, err })

            Chat.find({ "_id": doc._id })
            .populate("sender")
            .exec((err, doc)=> {

                return io.emit("Output Chat Message", doc);
            })
          })
      } catch (error) {
        console.error(error);
      }
    })
   })

})


//use this to show the image you have in node js server to client (react js)
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use('/uploads', express.static('uploads'));




if(process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))

    app.get('*',(req,res) => {
        res.sendFile(path.join(__dirname,'client','build','index.html'))
    })
}


module.exports = app



server.listen(PORT, () => {
  console.log(`Server Running at ${PORT}`)
});
