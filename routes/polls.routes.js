const express =require( 'express')
const Poll = require("../models/poll.model");
const RestrictionPoll = require("../models/restrictionpoll.model");
const Comment = require("../models/comment.model");
const Suggestion = require("../models/suggestion.model");


const router = express.Router()

router.route('/sendpolldown/:pollId/:groupId').put((req, res) => {
  console.log("sending poll down",req.params)

       Poll.findByIdAndUpdate(req.params.pollId, {$addToSet : {
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
router.route('/marksentdown/:pollId').put((req, res) => {
  console.log("marking sent down",req.params.pollId,re.body)
  Poll.findByIdAndUpdate(req.params.pollId, {
  sentdown:true,allmembers:req.body
}).exec(function(err,docs){
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
router.route('/approveofsendingpolldown/:pollId/:userId').put((req, res) => {
  Poll.findByIdAndUpdate(req.params.pollId, {$addToSet : {
  approval:req.params.userId
}}).exec(function(err,docs){
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
router.route('/withdrawapprovalofsendingpolldown/:pollId/:userId').put((req, res) => {
  Poll.findByIdAndUpdate(req.params.pollId, {$pull : {
  approval:req.params.userId
}}).exec(function(err,docs){
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





  router.route('/getpolls/:groupId').get((req, res) => {
    console.log("getting polls")
    Poll.find({groupIds:req.params.groupId})
    .populate("createdby")
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

  router.route('/notificationsent/:pollId').put((req, res) => {
    let pollId = req.params.pollId
    const updatedPoll=Poll.findByIdAndUpdate(pollId, {
    notificationsent:true
  }).exec(function(err,docs){
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

  router.route('/ratificationnotificationsent/:pollId').put((req, res) => {
    let pollId = req.params.pollId
    const updatedPoll=Poll.findByIdAndUpdate(pollId, {
    ratificationnotificationsent:true
  }).exec(function(err,docs){
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


  router.route('/restrictionnotificationsent/:pollId').put((req, res) => {
    let pollId = req.params.pollId
    const updatedPoll=RestrictionPoll.findByIdAndUpdate(pollId, {
    notificationsent:true
  }).exec(function(err,docs){
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


  router.route('/restrictionratificationnotificationsent/:pollId').put((req, res) => {
    let pollId = req.params.pollId
    const updatedPoll=RestrictionPoll.findByIdAndUpdate(pollId, {
    ratificationnotificationsent:true
  }).exec(function(err,docs){
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





  router.route('/getrestrictionpolls/:groupId').get((req, res) => {
    console.log("getting restriction polls")
    RestrictionPoll.find({groupId:req.params.groupId})
    .populate("createdby")
    .populate("usertorestrict")
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


  router.route('/deletepoll/:pollId').delete((req, res) => {
          Poll.findByIdAndDelete(req.params.pollId)
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

router.route('/deleterestrictionpoll/:pollId').delete((req, res) => {
        RestrictionPoll.findByIdAndDelete(req.params.pollId)
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

router.route('/getcomments/:postId').get((req, res) => {
  console.log("getting comments",req.params.postId)
  Comment.find({postid:req.params.postId})
  .populate('createdby')
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


router.route('/deletecomment/:commentId').delete((req, res) => {
        Comment.findByIdAndDelete(req.params.commentId)
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



router.route('/createpoll/:pollId').post((req, res) => {
  let pollId = req.params.pollId;

console.log("NEW POLL",req.body)
  var newPoll=new Poll({
    _id: pollId,
    groupIds:req.body["groupIds"],
    local :req.body["local"],
    approval :req.body["approval"],
    level:req.body["level"],
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
    groupId:req.body["groupId"],
    groupIds:req.body["groupIds"],
    local :req.body["local"],
    explanation:req.body["explanation"],
    usertorestrict:req.body["usertorestrict"],
    usertorestrictname:req.body["usertorestrictname"],
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
      data:doc,
      id:restrictionpollid
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

router.route('/getsuggestions/:pollId').get((req, res) => {
  console.log("getting suggestions",req.params.pollId)
  Suggestion.find({pollid:req.params.pollId})
  .populate('createdby')
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


router.route('/approveofsuggestion/:suggestionId/:userId').put((req, res) => {
  let suggestionId = req.params.suggestionId
  let userId = req.params.userId;
  console.log(suggestionId,userId)

  Suggestion.findByIdAndUpdate(suggestionId, {$addToSet : {
  approval:userId
}})  .exec(function(err,docs){
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

router.route('/withdrawapprovalofsuggestion/:suggestionId/:userId').put((req, res) => {
  let suggestionId = req.params.suggestionId
  let userId = req.params.userId;
  console.log(suggestionId,userId)

  Suggestion.findByIdAndUpdate(suggestionId, {$pull : {
  approval:userId
}})  .exec(function(err,docs){
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

router.route('/approveofrestriction/:pollId/:userId').put((req, res) => {
  let pollId = req.params.pollId
  let userId = req.params.userId;
  console.log(pollId,userId)
  RestrictionPoll.findByIdAndUpdate(pollId, {$addToSet : {
  approval:userId
}}).exec(function(err,docs){
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

router.route('/withdrawapprovalofrestriction/:pollId/:userId').put((req, res) => {
  let pollId = req.params.pollId
  let userId = req.params.userId;
  console.log(pollId,userId)
  RestrictionPoll.findByIdAndUpdate(pollId, {$pull : {
  approval:userId
}}).exec(function(err,docs){
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

module.exports= router
