const express =require( 'express')
const router = express.Router();
const Lead = require("../models/lead.model");

const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);



router.get("/", (req, res, next) => {
    Lead.find()
      .then(lead => res.json(lead))
      .catch(err => res.status(400).json('Error: ' + err));
  })

  router.get("/:leadId", (req, res, next) => {
      Lead.findById(req.params.leadId)
        .then(lead => res.json(lead))
        .catch(err => res.status(400).json('Error: ' + err));
    })


  router.delete("/:leadId", (req, res, next) => {
      Lead.findByIdAndDelete(req.params.leadId)
      .exec()
    })



  router.route('/createlead/:leadId').post((req, res) => {
    let leadId = req.params.leadId;
    console.log("req.body",req.body)
    var newLead=new Lead({
      _id: leadId,
      title:req.body.title,
      description:req.body.description,
      location:req.body.location,
      coordinates:req.body.coordinates,
      time:req.body.time,
      duration:req.body.duration,
      timecreated:req.body.timecreated
        });
console.log(newLead)

  newLead.save((err,doc) => {
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
