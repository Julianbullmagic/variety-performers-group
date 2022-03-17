const express =require( 'express')
const router = express.Router();
const Event = require("../models/event.model");
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
  secure: true
});
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);


router.get("/getevents/:groupId", (req, res, next) => {
    Event.find({groupIds:req.params.groupId})
    .populate('createdby')
      .then(rule => res.json(rule))
      .catch(err => res.status(400).json('Error: ' + err));
  })

router.get("/:eventId", (req, res, next) => {
    Event.findById(req.params.eventId)
    .populate('createdby')
      .then(rule => res.json(rule))
      .catch(err => res.status(400).json('Error: ' + err));
  })

  router.route('/notificationsent/:eventId').put((req, res) => {
    let eventId = req.params.eventId
    Event.findByIdAndUpdate(eventId, {
    notificationsent:true
  }).exec()
  })
  router.route('/approvalnotificationsent/:eventId').put((req, res) => {
    let eventId = req.params.eventId
    Event.findByIdAndUpdate(eventId, {
    approvalnotificationsent:true
  }).exec()
  })

  router.delete("/:eventId", (req, res, next) => {
      Event.findByIdAndDelete(req.params.eventId)
      .exec()
      cloudinary.v2.uploader.destroy(req.body.images[0],
        function(error, result){
          console.error(error)
          console.log(result)
    })
    })


    router.route('/approveofevent/:eventId/:userId').put((req, res) => {
      let eventId = req.params.eventId
      let userId = req.params.userId;
      console.log(eventId,userId)
      const updatedEvent=Event.findByIdAndUpdate(eventId, {$addToSet : {
      approval:userId
    }}).exec()
    })

    router.route('/withdrawapprovalofevent/:eventId/:userId').put((req, res) => {
      let eventId = req.params.eventId
      let userId = req.params.userId;
      console.log(eventId,userId)
      const updatedEvent=Event.findByIdAndUpdate(eventId, {$pull : {
      approval:userId
    }}).exec()
    })

    router.route('/marksentdown/:eventId').put((req, res) => {
      const updatedEvent=Event.findByIdAndUpdate(req.params.eventId, {
      sentdown:true
    }).exec()
    })

    router.route('/sendeventdown/:eventId/:groupId').put((req, res) => {
      console.log("sending event down",req.params)

           Event.findByIdAndUpdate(req.params.eventId, {$addToSet : {
            groupIds:req.params.groupId
          }},
          (err, updatedBoard) => {
          if (err) {
            res.json({
              success: false,
              msg: 'Failed to update event'
            })
          } else {
            res.json({success: true, msg: 'group added to event'})
          }
        }
      )
    })

  router.route('/createevent/:eventId').post((req, res) => {
    let eventId = req.params.eventId;
    console.log("level",req.body)
    var newEvent=new Event({
      _id: eventId,
      title :req.body["title"],
      description :req.body["description"],
      level :req.body["level"],
      starttime:req.body["starttime"],
      endtime:req.body["endtime"],
      local :req.body["local"],
      groupIds :req.body["groupIds"],
      createdby :req.body["createdby"],
      location:req.body["location"],
      coordinates:req.body["coordinates"],
      images:req.body["images"],
      timecreated:req.body["timecreated"],
      approval:req.body["approval"]
    });

  newEvent.save((err,doc) => {
    if(err){
      res.status(400).json({
        message: "The Item was not saved",
        errorMessage : err.message
     })
    }else{
      res.status(201).json({
        message: "Item was saved successfully",
        data:doc
     })
    }
  })})

module.exports= router
