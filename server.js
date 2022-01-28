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
const Lead = require("./models/lead.model");
const Post = require("./models/post.model");
const Poll = require("./models/poll.model");
const Purchase = require("./models/purchase.model");
const RestrictionPoll = require("./models/restrictionpoll.model");
const Comment = require("./models/comment.model");



var geodist = require('geodist')





//comment out before building for production
const PORT = process.env.PORT || 5000

const app = express();
const server = require("http").createServer(app);


const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000"||"https://variety-performers-group.herokuapp.com",
    methods: ["GET", "POST"]
  }
});



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
    var d = new Date();
    var n = d.getTime();

    let users=await User.find().exec()
    let events=await Event.find().exec()
    let restrictions=await Restriction.find().exec()
    let posts=await Post.find().exec()
    let leads=await Lead.find().exec()
    let purchases=await Purchase.find().exec()
    let polls=await Poll.find().exec()
    let restrictionpolls=await RestrictionPoll.find().exec()
    let comments=await Comment.find().exec()

for (let item of events){
  if (n-item.timecreated>2629800000){
    Event.findByIdAndDelete(item._id).exec()
  }
}
for (let item of restrictions){
  if (n-item.timecreated>2629800000){
    Restriction.findByIdAndDelete(item._id).exec()
  }
}
for (let item of posts){
  if (n-item.timecreated>2629800000){
    Post.findByIdAndDelete(item._id).exec()
  }
}
for (let item of leads){
  if (n-item.timecreated>2629800000){
    Lead.findByIdAndDelete(item._id).exec()
  }
}
for (let item of purchases){
  if (n-item.timecreated>2629800000){
    Purchase.findByIdAndDelete(item._id).exec()
  }
}
for (let item of restrictionpolls){
  if (n-item.timecreated>2629800000){
    RestrictionPoll.findByIdAndDelete(item._id).exec()
  }
}
for (let item of polls){
  if (n-item.timecreated>2629800000){
    Poll.findByIdAndDelete(item._id).exec()
  }
}
for (let item of comments){
  if (n-item.timecreated>2629800000){
    Comment.findByIdAndDelete(item._id).exec()
  }
}




for (let user of users){
  let recentsignins=[]
  let date = new Date(user.created); // some mock date
  let millisecondssinceusercreated = date.getTime()
  millisecondssinceusercreated=n-millisecondssinceusercreated
  for (let login of user.signins){
    console.log("login",login)
    let difference=n-login
    console.log(difference)
    if (difference>2629800000){
      recentsignins.push(login)
    }


    console.log(recentsignins)
    console.log("milliseconds",millisecondssinceusercreated)
    if(recentsignins.length<3&&millisecondssinceusercreated>2629800000){
      await User.findByIdAndUpdate(user._id,{active:false}).exec()
    }
    if(recentsignins.length>3){
      await User.findByIdAndUpdate(user._id,{active:true}).exec()
    }
  }
}

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

var users={}


io.on("connection", socket => {


 //  socket.on('disconnect', function () {
 //     console.log("disconnecting",socket.id)
 //     console.log(users)
 //     for (let x in users){
 //       if(users[`${x}`]==socket.id){
 //         delete users[`${x}`]
 //       }
 //     }
 //     console.log(users)
 // });



  socket.on("new user",function(data){

      socket.name=data
      console.log("NEW USER",data)
        users[`${socket.name}`]=socket.id
      console.log("new room",data.toString())
      let da=data
      socket.join(data)
      console.log(io.sockets.adapter.rooms)

  })


  socket.on("join room",async function(room){
    console.log("join room!",room.userName)
    socket.join(room.room);

    let us=room.userName
    socket.join(us)
    console.log(io.sockets.adapter.rooms)

    let user = await User.findById(room.userId).populate('recentprivatemessages').exec()
    let result = user.recentprivatemessages.filter(us =>!(us.sender==room.recipientId));
    let chatids=result.map(item=>item._id)
    let usertwo = await User.findByIdAndUpdate(room.userId,{recentprivatemessages:chatids},{new:true}).exec()
    user.recentprivatemessages=result
    io.to(socket.id).emit("Joined Room", user);
  })


  socket.on("Input Chat Message To User", msg => {
console.log("IMPUTTING MESSAGE TO USER")
    connect.then(db => {
      try {
        var d = new Date();
        var n = d.getTime();
        console.log("message",msg)
          var chat = new Chat({ message: msg.chatMessage, sender:msg.userId, type: msg.type,recipient:msg.recipient._id,timecreated:n })


  console.log("chat",chat)
          chat.save((err, doc) => {
            console.log("error",err)
            console.log(doc)
            if(err) return res.json({ success: false, err });


console.log("MSG RECIPIENT!!!!!!!!!",msg.recipient._id)
            User.findByIdAndUpdate(msg.recipient._id,{$push : {
            recentprivatemessages:doc._id
            }}).exec(function(err,docs){
              if(err){
                      console.log(err);
                  }else{
                      console.log(docs)
            }
             })



            Chat.find({ "_id": doc._id })
            .populate('sender')
            .exec((err, doc)=> {
              let doccopy=JSON.parse(JSON.stringify(doc[0]))
              let sender=doc[0][`sender`][`_id`]
              doccopy.sender=sender
              console.log("SENDER",doccopy)
              io.emit("Output pm", doccopy);
              return io.to(msg.room).emit("Output Chat Message", doc);
            })
          })
      } catch (error) {
        console.error(error);
      }
    })
   })


  socket.on("Input Chat Message", msg => {

    connect.then(db => {
      try {
        console.log("message",msg)
        var d = new Date();
        var n = d.getTime();
          var chat = new Chat({ message: msg.chatMessage, sender:msg.userId, type: msg.type,timecreated:n })


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
