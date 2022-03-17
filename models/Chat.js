const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    message: {
        type: String
        },
    groupId:{type:String},

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient:String,
    type: {
        type: String
    },
    timecreated:Number,
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = { Chat }
