const mongoose =require( 'mongoose')
const RestrictionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  usertorestrict: {type: mongoose.Schema.ObjectId, ref: 'User'},
  restriction: {type: String},
  duration:Number,
  timecreated: Number
})

module.exports=mongoose.model('Restriction', RestrictionSchema)
