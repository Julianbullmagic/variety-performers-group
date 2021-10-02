const mongoose = require('mongoose');


const ruleSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  rule: {
    type: String,
    required: true
  },
  createdby:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  explanation:String,
  approval: [{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
  notificationsent:{type:Boolean,default:false},
  ratificationnotificationsent:{type:Boolean,default:false},
  timecreated:Number
})

module.exports =  mongoose.model('Rule', ruleSchema)
