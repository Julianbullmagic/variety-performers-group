const mongoose = require('mongoose');


const leadSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title:String,
  description:String,
  location:String,
  coordinates:[Number],
  time:String,
  duration:String,
  timecreated:Number
})

module.exports =  mongoose.model('Lead', leadSchema)
