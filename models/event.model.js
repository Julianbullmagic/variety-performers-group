const mongoose = require('mongoose');


const eventSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title:String,
  description:String,
  location:String,
  images:[{type:String}],
  coordinates:[Number],
  approval: [{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
  timecreated:Number
})

module.exports =  mongoose.model('Event', eventSchema)
