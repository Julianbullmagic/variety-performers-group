const express =require( 'express')
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");


const router = express.Router()



  router.route('/getposts').get((req, res) => {
    console.log("getting posts")
    Post.find()
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

  router.route('/notificationsent/:postId').put((req, res) => {
    let postId = req.params.postId
    Post.findByIdAndUpdate(postId, {
    notificationsent:true
  }).exec()
  })


  router.route('/deletepost/:postId').delete((req, res) => {
          Post.findByIdAndDelete(req.params.postId)
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



router.route('/createpost/:postId').post((req, res) => {
  let postId = req.params.postId;


  var newPost=new Post({
    _id: postId,
    post:req.body["post"],
    preview :req.body["preview"],
    timecreated:req.body["timecreated"],
    createdby:req.body["createdby"]
  });

console.log(newPost)
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
