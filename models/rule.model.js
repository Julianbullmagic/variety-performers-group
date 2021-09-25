const mongoose = require('mongoose');


const ruleSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  rule: {
    type: String,
    required: true
  },

  explanation:String,
  approval: [{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
  timecreated:Number
})

module.exports =  mongoose.model('Rule', ruleSchema)
