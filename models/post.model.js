const mongoose =require( 'mongoose')
const PostSchema = new mongoose.Schema({
  post: {type: String},
  preview: {
    url:String,
    image:String,
    title:String
  },
  notificationsent:{type:Boolean,default:false},
  likes: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  comments: [{type: mongoose.Schema.ObjectId, ref: 'Comment'}],
  createdby: {type: mongoose.Schema.ObjectId, ref: 'User'},
  timecreated: Number
})

module.exports=mongoose.model('Post', PostSchema)
