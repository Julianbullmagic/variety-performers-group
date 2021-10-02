const mongoose =require( 'mongoose')
const RestrictionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  usertorestrict: {type: mongoose.Schema.ObjectId, ref: 'User'},
  restriction: {type: String},
  notificationsent:{type:Boolean,default:false},
  ratificationnotificationsent:{type:Boolean,default:false},
  duration:Number,
  timecreated: Number
})

module.exports=mongoose.model('Restriction', RestrictionSchema)
