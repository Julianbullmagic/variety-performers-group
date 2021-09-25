const mongoose =require( 'mongoose')
const RestrictionPollSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  usertorestrict: {type: mongoose.Schema.ObjectId, ref: 'User'},
  usertorestrictname: {type: String},
  restriction: {type: String},
  approval: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  duration:Number,
  comments: [{type: mongoose.Schema.ObjectId, ref: 'Comment'}],
  createdby: {type: mongoose.Schema.ObjectId, ref: 'User'},
  timecreated: Number
})

module.exports=mongoose.model('RestrictionPoll', RestrictionPollSchema)
