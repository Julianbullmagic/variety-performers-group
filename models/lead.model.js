const mongoose = require('mongoose');


const leadSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title:String,
  description:String,
  location:String,
  coordinates:[Number],
  genres:[String],
  customername:String,
  views:[{type: mongoose.Schema.ObjectId, ref: 'User'}],
  notificationsent:{type:Boolean,default:false},
  time:String,
  duration:String,
  timecreated:Number,
  phone:Number,
  email:String
})

module.exports =  mongoose.model('Lead', leadSchema)
