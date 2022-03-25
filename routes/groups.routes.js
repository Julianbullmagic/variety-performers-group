const express =require( 'express')
const router = express.Router();
const userCtrl =require( '../controllers/user.controller')
const authCtrl =require( '../controllers/auth.controller')
const User = require("../models/user.model");
const Event = require("../models/event.model");
require('dotenv').config();
const nodemailer = require('nodemailer');
const Rule = require("../models/rule.model");
const Restriction= require("../models/restriction.model");
const Group = require("../models/group.model");
const jwt =require( 'jsonwebtoken')
const expressJwt =require( 'express-jwt')
const config =require( './../config/config')
var random = require('mongoose-simple-random');

const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

router.route('/approveofnewmember/:newMemberId/:userId').put((req, res) => {
  let newMemberId = req.params.newMemberId
  let userId = req.params.userId;
  console.log(newMemberId,userId)

  User.findByIdAndUpdate(newMemberId, {$push : {
  approval:userId
}}).exec()
})

router.route('/withdrawapprovalofnewmember/:newMemberId/:userId').put((req, res) => {
  let newMemberId = req.params.newMemberId
  let userId = req.params.userId;
  console.log(newMemberId,userId)

  User.findByIdAndUpdate(newMemberId, {$pull : {
  approval:userId
}}).exec()
})

router.route('/newmemberapproved/:newMemberId').put((req, res) => {
  console.log("approving new member")
  let newMemberId = req.params.newMemberId
  console.log(newMemberId)
  User.findByIdAndUpdate(newMemberId,{
  approvedmember:true
}).exec()
})


router.post("/getpasswordresettoken/:email", (req, res) => {
console.log(req.params.email)
  const token = jwt.sign({
    email: req.params.email
  }, config.jwtSecret
, {expiresIn: "1h"})
console.log("token",token)
  return res.json({
    token:token
  })
})
router.post("/verifychangepasswordjwt/:token/:email", (req, res) => {
console.log(req.params.email)
jwt.verify(req.params.token, config.jwtSecret, (err,decoded) => {
              if(err){
                res.status(400).json(err)
              } else {
                if(decoded.email.toLowerCase()==req.params.email.toLowerCase()){
                  res.status(200).json("can log in")
              }else{
                res.status(400).json('Error: emails do not match')
              }              }
          })
})

router.get("/getusers", (req, res) => {
  User.find()
  .populate("restrictions")
  .populate("groupstheybelongto")
  .populate("recentprivatemessages")
  .then(rule => res.json(rule))
  .catch(err => res.status(400).json('Error: ' + err));
});

router.get("/finduser/:userId", (req, res) => {
  User.find({_id:req.params.userId})
  .populate("restrictions")
  .populate("groupstheybelongto")
  .populate("highergroupstheybelongto")
  .exec(function(err,docs){
    if(err){
      console.error(err);
    }else{
      res.status(200).json({
        data: docs
      })}
    })})


    router.get("/findgroup/:groupId", (req, res, next) => {
      const items=Group.find({_id:req.params.groupId})
      .populate({path: 'members'})
      .populate('groupabove')
      .populate('groupsbelow')
      .populate({
  path: 'groupsbelow',
  populate: {
    path: 'groupsbelow',
    populate:{path:'members'}
  },
  populate: {
    path: 'members',
  }
}).exec(function(err,docs){
        if(err){
          console.error(err);
        }else{
          res.status(200).json({
            data: docs
          });
        }
      })})



        router.get("/findgroups/:cool", (req, res, next) => {
          const items=Group.find({cool:req.params.cool}
)
          .populate('members')
          .exec(function(err,docs){
            if(err){
              console.error(err);
            }else{
              res.status(200).json({
                data: docs
              });
            }

          })})

          router.post("/creategroup", (req, res, next) => {
            console.log(req.body)
            let newGroup = new Group({
              _id: req.body['_id'],
              level:req.body['level'],
              images:req.body['images'],
              cool:req.body['cool'],
              groupabove:req.body['groupabove'],
              timecreated:req.body['timecreated'],
              members:req.body["members"],
              allmembers:req.body["members"],
              title:req.body['title'],
              description:req.body['description'],
            });

            newGroup.save((err) => {
              if(err){
                res.status(400).json({
                  message: "The Item was not saved",
                  errorMessage : err.message
                })
              }else{
                res.status(201).json({
                  message: "Item was saved successfully",
                  data:newGroup._id
                })
              }
            })
          })


          router.delete("/deleterestriction", (req, res, next) => {
            console.log("DELETEING RESTRICTION",req.body)
            Restriction.findOneAndDelete({ $and: [{ usertorestrict: req.body.usertorestrict._id },
             { restriction: req.body.restriction }, { duration: req.body.duration }] },)
            .exec(function(err,docs){
              if(err){
                      console.error(err);
                  }else{
                    console.log("docs",docs)
                      res.status(200).json({
                                  data: docs
                              });
            }
          })
          })

          router.put("/removerestrictionfromuser/:restId/:userId", (req, res, next) => {
            console.log("DELETEING RESTRICTION",req.params)
            User.findByIdAndUpdate(req.params.userId,{$pull : {
              restrictions:req.params.restId
            }})
            .populate('restrictions')
            .exec(function(err,docs){
              if(err){
                      console.error(err);
                  }else{
                    console.log("docs",docs)
                      res.status(200).json({
                                  data: docs
                              });
            }
          })
          })

          router.post("/createuserrrestriction", (req, res) => {
            const restriction = new Restriction(req.body);
            console.log("restriction",restriction)
            restriction.save((err, doc) => {
              if (err) return res.json({ success: false, err });
              return res.status(200).json({
                success: true,
                data:doc
              });
            });
          });

          router.put("/addrestrictiontouser/:user/:restriction", (req, res, next) => {
            console.log("adding restriction to user",req.params.user,req.params.restriction)
            User.findByIdAndUpdate(req.params.user, {$addToSet : {
              restrictions:req.params.restriction
            }})
            .populate('restrictions')
            .exec(function(err,docs){
              if(err){
                console.error(err);
              }else{

                res.status(200).json({
                  data:docs,
                  message: "User updated successfully"
                })
              }
            })
          })


          router.put("/removerestrictionfromuser/:user/:restriction", (req, res, next) => {
            console.log("removing restriction from user",req.params.user,req.params.restriction)
            User.findByIdAndUpdate(req.params.user, {$pull : {
              restrictions:req.params.restriction
            }}).exec(function(err,docs){
              if(err){
                console.error(err);
              }else{

                res.status(200).json({
                  data:docs,
                  message: "User updated successfully"
                })
              }
            })
          })



            router.post('/sendemailnotification', (req, res, next) => {
              console.log("send email notfication",req.body.message,req.body.emails)

              if(req.body.emails.length>0){
                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                  }
                })
                const optionsArray=req.body.emails.map(email=>{
                  const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: req.body.subject,
                    text: `${req.body.message}`
                  };
                  return mailOptions
                })

                optionsArray.forEach(sendEmails)

                function sendEmails(item){
                  transporter.sendMail(item, function(error, info){
                    if (error) {
                      console.error(error);
                    } else {
                      console.log('Email sent: ' + info.response)
                    }
                  })

                }
              }
            })


              router.get("/finduserrestrictions/:userId", (req, res, next) => {
                const items=User.findById(req.params.userId)
                .populate('restrictions')
                .exec(function(err,docs){
                  if(err){
                    console.error(err);
                  }else{
                    res.status(200).json({
                      data: docs
                    });
                  }
                })})





                router.get("/getuser/:userId", (req, res, next) => {
                  var userId=req.params.userId
                  console.log("userId in router",userId)
                  const items=User.findById(userId)
                  .populate("recentprivatemessages")
                  .populate({path:"restrictions",
                                populate: {
                                  path: 'usertorestrict'}})
                  .exec(function(err,docs){
                    if(err){
                      console.error(err);
                    }else{
                      res.status(200).json({
                        data:docs,
                        message: "fetching user"
                      })
                    }
                  })
                })



                router.post("/createuser", (req, res, next) => {
                  var user=req.body.user
                  let newUser = new User(user);

                  console.log("new user in server",newUser)
                  newUser.save((err,docs) => {
                    if(err){
                      console.error(err)
                      res.status(400).json({
                        message: "The Item was not saved",
                        errorMessage : err.message
                      })
                    }else{
                      console.log("DOCS",docs)
                      res.status(201).json({
                        message: "Item was saved successfully",
                        data:docs
                      })
                    }
                  })

                })

                router.put("/updateuser/:user", (req, res, next) => {
                  User.findByIdAndUpdate(req.params.user, req.body).exec(function(err,docs){
                    if(err){
                      console.error(err);
                    }else{

                      res.status(200).json({
                        data:docs,
                        message: "User updated successfully"
                      })
                    }
                  })
                })

                module.exports= router
