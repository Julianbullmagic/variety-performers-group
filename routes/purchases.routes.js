const express =require( 'express')
const router = express.Router();
const Purchase = require("../models/purchase.model");

const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);



router.get("/", (req, res, next) => {
    Purchase.find()
      .then(purchase => res.json(purchase))
      .catch(err => res.status(400).json('Error: ' + err));
  })

  router.get("/:purchaseId", (req, res, next) => {
      Purchase.findById(req.params.purchaseId)
        .then(rule => res.json(rule))
        .catch(err => res.status(400).json('Error: ' + err));
    })


  router.delete("/:purchaseId", (req, res, next) => {
      Purchase.findByIdAndDelete(req.params.purchaseId)
      .exec()
    })



    router.route('/approveofpurchase/:purchaseId/:userId').put((req, res) => {
      let purchaseId = req.params.purchaseId
      let userId = req.params.userId;
      console.log(purchaseId,userId)

      const updatedPurchase=Purchase.findByIdAndUpdate(purchaseId, {$addToSet : {
      approval:userId
    }}).exec()
    })

    router.route('/withdrawapprovalofpurchase/:purchaseId/:userId').put((req, res) => {
      let purchaseId = req.params.purchaseId
      let userId = req.params.userId;
      console.log(purchaseId,userId)

      const updatedpurchase=Purchase.findByIdAndUpdate(purchaseId, {$pull : {
      approval:userId
    }}).exec()
    })




  router.route('/createpurchase/:purchaseId').post((req, res) => {
    let purchaseId = req.params.purchaseId;
    console.log("req.body",req.body)

    var newPurchase=new Purchase({
      _id: purchaseId,
      title :req.body["title"],
      description:req.body["description"],
      images :req.body["images"],
      price:req.body["price"],
      quantity:req.body["quantity"],
      timecreated:req.body["timecreated"],
      approval:req.body["approval"]
        });
console.log("NEW PURCHASE",newPurchase)

  newPurchase.save((err,doc) => {
    if(err){
      res.status(400).json({
        message: "The Item was not saved",
        errorMessage : err.message
     })
    }else{
      res.status(201).json({
        message: "Item was saved successfully",
        data:doc
     })
    }
  })})





module.exports= router
