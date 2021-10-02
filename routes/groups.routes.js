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
var random = require('mongoose-simple-random');


const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);


router.get("/getusers", (req, res) => {
  User.find({"active":true})
  .populate("restrictions")
    .then(rule => res.json(rule))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.post("/createreview/:reviewid", (req, res, next) => {
   let newReview = new Review({
     _id: req.params.reviewid,
     rating:req.body['rating'],
     explanation:req.body['explanation'],
     timecreated: req.body["timecreated"],
     userId:req.body['userId'],
     groupId:req.body['groupId'],
     postedBy: req.body["postedBy"]
  });


   newReview.save((err) => {
     if(err){
       res.status(400).json({
         message: "The Item was not saved",
         errorMessage : err.message
      })
     }else{
       res.status(201).json({
         message: "Item was saved successfully"
      })
     }
   })
})

router.delete("/deleterestriction/:restrictionId", (req, res, next) => {
    Restriction.findByIdAndDelete(req.params.restrictionId)
    .exec()
  })

router.post("/createuserrrestriction", (req, res) => {

    const restriction = new Restriction(req.body);
console.log(restriction)
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
  User.findByIdAndUpdate(req.params.user, {$push : {
  restrictions:req.params.restriction
  }}).exec(function(err,docs){
    if(err){
            console.log(err);
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
            console.log(err);
        }else{

            res.status(200).json({
              data:docs,
              message: "User updated successfully"
                    })
  }
   })
})

router.get("/findreviews/:groupId/:userId", (req, res, next) => {
  console.log("ids in server",req.params.userId)

      const items=Review.find({groupId:req.params.groupId, userId:req.params.userId})
      .exec(function(err,docs){
        if(err){
                console.log(err);
            }else{
                res.status(200).json({
                            data: docs
                        });
      }

  })})


router.post('/sendemailnotification', (req, res, next) => {
  console.log("send email notfication")

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
        text: req.body.message
      };
      return mailOptions
    })

    optionsArray.forEach(sendEmails)

    function sendEmails(item){
      transporter.sendMail(item, function(error, info){
        if (error) {
      	console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })

    }
  }})











        router.get("/finduserrestrictions/:userId", (req, res, next) => {
              const items=User.findById(req.params.userId)
              .populate('restrictions')
              .exec(function(err,docs){
                if(err){
                        console.log(err);
                    }else{
                        res.status(200).json({
                                    data: docs
                                });
              }
          })})





router.get("/getuser/:userId", (req, res, next) => {
  var userId=req.params.userId
  console.log("userId in router",userId)
  const items=User.findById(userId, function (err, docs) {
    if (err){
        console.log(err);
    }
    else{
        console.log("Result : ", docs);
        res.status(200).json({
                    data: docs
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
            console.log(err)
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
            console.log(err);
        }else{

            res.status(200).json({
              data:docs,
              message: "User updated successfully"
                    })
  }
   })
})





module.exports= router
