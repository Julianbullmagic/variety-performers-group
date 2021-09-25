const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { Chat } = require("../models/Chat");
var random = require('mongoose-simple-random');
const User = require("../models/user.model");





router.get("/getChats",async (req, res) => {
  console.log("getting chats")
    await Chat.find()
        .populate("sender")
        .exec((err, chats) => {
            if(err) return res.status(400).send(err);
            res.status(200).send(chats)
        })
})







module.exports = router;
