const express =require( 'express')
const router = express.Router();
const Rule = require("../models/rule.model");
const Group=require("../models/group.model")
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

router.route('/sendruledown/:ruleId/:groupId').put((req, res) => {
  console.log("sending rule down",req.params)

       Rule.findByIdAndUpdate(req.params.ruleId, {$addToSet : {
        groupIds:req.params.groupId
      }},
      (err, updatedBoard) => {
      if (err) {
        res.json({
          success: false,
          msg: 'Failed to update rule'
        })
      } else {
        res.json({success: true, msg: 'group added to rule'})
      }
    }
  )
})

router.get("/getrules/:groupId", (req, res, next) => {
    Rule.find({groupIds:req.params.groupId})
    .populate("createdby")
      .then(rule => res.json(rule))
      .catch(err => res.status(400).json('Error: ' + err));
  })

  router.get("/:ruleId", (req, res, next) => {
      Rule.findById(req.params.ruleId)
      .populate('createdby')
        .then(rule => res.json(rule))
        .catch(err => res.status(400).json('Error: ' + err));
    })


  router.delete("/:ruleId", (req, res, next) => {
      Rule.findByIdAndDelete(req.params.ruleId)
      .exec(function(err,docs){
            if(err){
              console.error(err);
            }else{
              res.status(200).json({
                data: docs
              });
            }
          })
    })



    router.route('/notificationsent/:ruleId').put((req, res) => {
      let ruleId = req.params.ruleId
      const updatedRule=Rule.findByIdAndUpdate(ruleId, {
      notificationsent:true
    }).exec(function(err,docs){
          if(err){
                  console.error(err);
              }else{
                console.log("docs",docs)
        }})
    })

    router.route('/marksentdown/:ruleId').put((req, res) => {
      let ruleId = req.params.ruleId
      console.log("marking sent down",ruleId)
      const updatedRule=Rule.findByIdAndUpdate(ruleId, {
      sentdown:true
    }).exec(function(err,docs){
          if(err){
                  console.error(err);
              }else{
                console.log("docs",docs)
        }})
    })

    router.route('/ruleratificationnotificationsent/:ruleId').put((req, res) => {
      const updatedPoll=Rule.findByIdAndUpdate(req.params.ruleId, {
      ratificationnotificationsent:true
    }).exec(function(err,docs){
          if(err){
                  console.error(err);
              }else{
                console.log("docs",docs)
        }})
    })

    router.route('/approveofrule/:ruleId/:userId').put((req, res) => {
      let ruleId = req.params.ruleId
      let userId = req.params.userId;
      console.log(ruleId,userId)

      const updatedRule=Rule.findByIdAndUpdate(ruleId, {$push : {
      approval:userId
    }}).exec(function(err,docs){
          if(err){
                  console.error(err);
              }else{
                console.log("docs",docs)
        }})
    })

    router.route('/withdrawapprovalofrule/:ruleId/:userId').put((req, res) => {
      let ruleId = req.params.ruleId
      let userId = req.params.userId;
      console.log(ruleId,userId)

      const updatedRule=Rule.findByIdAndUpdate(ruleId, {$pull : {
      approval:userId
    }}).exec(function(err,docs){
          if(err){
                  console.error(err);
              }else{
                console.log("docs",docs)
        }})
    })




  router.route('/createrule/:ruleId').post((req, res) => {
    let ruleId = req.params.ruleId;
    console.log("req.body, creating rule",req.body)
    var newRule=new Rule({
      _id: ruleId,
      rule :req.body["rule"],
      local :req.body["local"],
      level :req.body["level"],
      groupIds:req.body["groupIds"],
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
