const express =require( 'express')
const Poll = require("../models/poll.model");
const RestrictionPoll = require("../models/restrictionpoll.model");
const Comment = require("../models/comment.model");
const Suggestion = require("../models/suggestion.model");


const router = express.Router()



  router.route('/getpolls').get((req, res) => {
    console.log("getting polls")
    Poll.find()
    .populate("createdby")
    .exec(function(err,docs){
      if(err){
              console.log(err);
          }else{
            console.log("docs",docs)
              res.status(200).json({
                          data: docs
                      });
    }
})
  })

  router.route('/getrestrictionpolls').get((req, res) => {
    console.log("getting restriction polls")
    RestrictionPoll.find()
    .populate("createdby")
    .exec(function(err,docs){
      if(err){
              console.log(err);
          }else{
            console.log("docs",docs)
              res.status(200).json({
                          data: docs
                      });
    }
  })
  })


  router.route('/deletepoll/:pollId').delete((req, res) => {
          Poll.findByIdAndDelete(req.params.pollId)
          .exec()
})


router.route('/getcomments/:postId').get((req, res) => {
  console.log("getting comments",req.params.postId)
  Comment.find({postid:req.params.postId})
  .populate('createdby')
  .exec(function(err,docs){
    if(err){
            console.log(err);
        }else{
          console.log("docs",docs)
            res.status(200).json({
                        data: docs
                    });
  }
})
})


router.route('/deletecomment/:commentId').delete((req, res) => {
        Comment.findByIdAndDelete(req.params.commentId)
        .exec()
})



router.route('/createpoll/:pollId').post((req, res) => {
  let pollId = req.params.pollId;


  var newPoll=new Poll({
    _id: pollId,
    pollquestion:req.body["pollquestion"],
    timecreated:req.body["timecreated"],
    createdby:req.body["createdby"]
  });

console.log(newPoll)
newPoll.save((err,doc) => {
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



router.route('/createrestrictionpoll/:restrictionPollId').post((req, res) => {
  let restrictionpollid = req.params.restrictionPollId;

  var newRestrictionPoll=new RestrictionPoll({
    _id: restrictionpollid,
    usertorestrict:req.body["usertorestrict"],
    restriction:req.body["restriction"],
    duration:req.body["duration"],
    approval:req.body["approval"],
    timecreated:req.body["timecreated"],
    createdby:req.body["createdby"]
  });

console.log(newRestrictionPoll)
newRestrictionPoll.save((err,doc) => {
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


router.route('/createpollsuggestion/:suggestionId').post((req, res) => {
  let suggestionId = req.params.suggestionId;


  var newSuggestion=new Suggestion({
    _id: suggestionId,
    suggestion:req.body["suggestion"],
    pollid:req.body["pollid"],
    approval:req.body["approval"],
    timecreated:req.body["timecreated"],
    createdby:req.body["createdby"]
  });

console.log(newSuggestion)
newSuggestion.save((err,doc) => {
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

router.route('/deletesuggestion/:suggestionId').delete((req, res) => {
        Suggestion.findByIdAndDelete(req.params.suggestionId)
        .exec()
})

router.route('/getsuggestions/:pollId').get((req, res) => {
  console.log("getting suggestions",req.params.pollId)
  Suggestion.find({pollid:req.params.pollId})
  .populate('createdby')
  .exec(function(err,docs){
    if(err){
            console.log(err);
        }else{
          console.log("docs",docs)
            res.status(200).json({
                        data: docs
                    });
  }
})
})


router.route('/approveofsuggestion/:suggestionId/:userId').put((req, res) => {
  let suggestionId = req.params.suggestionId
  let userId = req.params.userId;
  console.log(suggestionId,userId)

  Suggestion.findByIdAndUpdate(suggestionId, {$addToSet : {
  approval:userId
}}).exec()
})

router.route('/withdrawapprovalofsuggestion/:suggestionId/:userId').put((req, res) => {
  let suggestionId = req.params.suggestionId
  let userId = req.params.userId;
  console.log(suggestionId,userId)

  Suggestion.findByIdAndUpdate(suggestionId, {$pull : {
  approval:userId
}}).exec()
})

router.route('/approveofrestriction/:pollId/:userId').put((req, res) => {
  let pollId = req.params.pollId
  let userId = req.params.userId;
  console.log(pollId,userId)

  RestrictionPoll.findByIdAndUpdate(pollId, {$addToSet : {
  approval:userId
}}).exec()
})

router.route('/withdrawapprovalofrestriction/:pollId/:userId').put((req, res) => {
  let pollId = req.params.pollId
  let userId = req.params.userId;
  console.log(pollId,userId)

  RestrictionPoll.findByIdAndUpdate(pollId, {$pull : {
  approval:userId
}}).exec()
})




module.exports= router
