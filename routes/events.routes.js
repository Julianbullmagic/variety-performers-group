const express =require( 'express')
const router = express.Router();
const Event = require("../models/event.model");

const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

router.get("/", (req, res, next) => {
    Event.find()
    .populate('createdby')
      .then(rule => res.json(rule))
      .catch(err => res.status(400).json('Error: ' + err));
  })


router.get("/:eventId", (req, res, next) => {
    Event.findById(req.params.eventId)
      .then(rule => res.json(rule))
      .catch(err => res.status(400).json('Error: ' + err));
  })

  router.route('/notificationsent/:eventId').put((req, res) => {
    let eventId = req.params.eventId
    Event.findByIdAndUpdate(eventId, {
    notificationsent:true
  }).exec()
  })


  router.delete("/:eventId", (req, res, next) => {

      Event.findByIdAndDelete(req.params.eventId)
      .exec()
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

  router.route('/createevent/:eventId').post((req, res) => {
    let eventId = req.params.eventId;
    var newEvent=new Event({
      _id: eventId,
      title :req.body["title"],
      description :req.body["description"],
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
