const express =require( 'express')
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const router = express.Router()

router.route('/markaspoliticalmarketing/:postId/:userId').put((req, res) => {
  Post.findByIdAndUpdate(req.params.postId, {$push : {
  politicalmarketing:req.params.userId
}}).exec(function(err,docs){
      if(err){
              console.error(err);
          }else{
            console.log("docs",docs)
    }
  })
})

router.route('/withdrawmarkaspoliticalmarketing/:postId/:userId').put((req, res) => {
  Post.findByIdAndUpdate(req.params.postId, {$pull : {
  politicalmarketing:req.params.userId
}}).exec(function(err,docs){
      if(err){
              console.error(err);
          }else{
            console.log("docs",docs)
    }
})
})

router.route('/sendpostdown/:postId/:groupId').put((req, res) => {
  console.log("sending post down",req.params)

       Post.findByIdAndUpdate(req.params.postId, {$addToSet : {
        groupIds:req.params.groupId
      }},
      (err, updatedBoard) => {
      if (err) {
        res.json({
          success: false,
          msg: 'Failed to update post'
        })
      } else {
        res.json({success: true, msg: 'group added to post'})
      }
    }
  )
})

router.route('/marksentdown/:postId').put((req, res) => {
  console.log("marking sent down",req.params.postId)
  const updatedRule=Post.findByIdAndUpdate(req.params.postId, {
  sentdown:true
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

  router.route('/getposts/:groupId').get((req, res) => {
    console.log("getting posts")
    Post.find({groupIds:req.params.groupId})
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

  router.route('/notificationsent/:postId').put((req, res) => {
    let postId = req.params.postId
    Post.findByIdAndUpdate(postId, {
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


  router.route('/deletepost/:postId').delete((req, res) => {
          Post.findByIdAndDelete(req.params.postId)
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



router.route('/createpost/:postId').post((req, res) => {
  let postId = req.params.postId;

  var newPost=new Post({
    _id: postId,
    post:req.body["post"],
    local :req.body["local"],
    level :req.body["level"],
    groupIds:req.body["groupIds"],
    preview :req.body["preview"],
    timecreated:req.body["timecreated"],
    createdby:req.body["createdby"]
  });

console.log("new post",newPost)
newPost.save((err,doc) => {
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

router.route('/createcomment/:commentId').post((req, res) => {
  let commentId = req.params.commentId;


  var newcomment=new Comment({
    _id: commentId,
    comment:req.body["comment"],
    postid:req.body["postid"],
    timecreated:req.body["timecreated"],
    createdby:req.body["createdby"]
  });

console.log(newcomment)
newcomment.save((err,doc) => {
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
