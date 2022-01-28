const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { Chat } = require("../models/Chat");
var random = require('mongoose-simple-random');
const User = require("../models/user.model");





router.get("/getChats",async (req, res) => {
  console.log("getting chats")
    await Chat.find({"recipient": undefined})
        .populate("sender")
        .exec((err, chats) => {
            if(err) return res.status(400).send(err);
            res.status(200).send(chats)
        })
})


router.get("/getChatsWithParticularUser/:recipientid/:myid", (req, res, next) => {

  Chat.find({$or:[{$and:[{recipient:req.params.recipientid},{sender:req.params.myid}]},{$and:[{recipient:req.params.myid},{sender:req.params.recipientid}]}]})
  .populate("sender")
  .populate("recipient")
  .exec((err, chats) => {
      if(err) return res.status(400).send(err);
      res.status(200).send(chats)
  })
  })




module.exports = router;
