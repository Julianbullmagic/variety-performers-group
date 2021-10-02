const express =require( 'express')
const router = express.Router();
const Rule = require("../models/rule.model");

const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);



router.get("/", (req, res, next) => {
    Rule.find()
    .populate("createdby")
      .then(rule => res.json(rule))
      .catch(err => res.status(400).json('Error: ' + err));
  })

  router.get("/:ruleId", (req, res, next) => {
      Rule.findById(req.params.ruleId)
        .then(rule => res.json(rule))
        .catch(err => res.status(400).json('Error: ' + err));
    })


  router.delete("/:ruleId", (req, res, next) => {

      Rule.findByIdAndDelete(req.params.ruleId)
      .exec()
    })



    router.route('/notificationsent/:ruleId').put((req, res) => {
      let ruleId = req.params.ruleId
      const updatedRule=Rule.findByIdAndUpdate(ruleId, {
      notificationsent:true
    }).exec()
    })


    router.route('/restrictionratificationnotificationsent/:ruleId').put((req, res) => {
      const updatedPoll=Rule.findByIdAndUpdate(req.params.ruleId, {
      ratificationnotificationsent:true
    }).exec()
    })

    router.route('/approveofrule/:ruleId/:userId').put((req, res) => {
      let ruleId = req.params.ruleId
      let userId = req.params.userId;
      console.log(ruleId,userId)

      const updatedRule=Rule.findByIdAndUpdate(ruleId, {$push : {
      approval:userId
    }}).exec()
    })

    router.route('/withdrawapprovalofrule/:ruleId/:userId').put((req, res) => {
      let ruleId = req.params.ruleId
      let userId = req.params.userId;
      console.log(ruleId,userId)

      const updatedRule=Rule.findByIdAndUpdate(ruleId, {$pull : {
      approval:userId
    }}).exec()
    })




  router.route('/createrule/:ruleId').post((req, res) => {
    let ruleId = req.params.ruleId;
    console.log("req.body",req.body)
    var newRule=new Rule({
      _id: ruleId,
      rule :req.body["rule"],
      createdby :req.body["createdby"],
      explanation:req.body["explanation"],
      timecreated:req.body["timecreated"],
      approval:req.body["approval"]
        });
console.log(newRule)

  newRule.save((err,doc) => {
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
