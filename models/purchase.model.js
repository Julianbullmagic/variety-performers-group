const mongoose = require('mongoose');


const purchaseSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title:String,
  description:String,
  images:[{type:String}],
  price:Number,
  quantity:String,
  approval: [{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
  timecreated:Number
})

module.exports =  mongoose.model('Purchase', purchaseSchema)
