const express = require('express');
const router = express.Router();
const { User } = require("../models/user.model");
const { Restriction } = require("../models/restriction.model");
const { auth } = require("../middleware/auth");


router.get("/", auth, (req, res) => {
  User.find()
  .populate("restrictions")
    .then(rule => res.json(rule))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.get("/:userId", auth, (req, res) => {
  console.log("getting user",req.params.userId)
  User.findById(req.params.userId)
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.get("/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
    });
});

router.post("/register", (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

router.post("/createuserrrestriction", (req, res) => {

    const restriction = new Restriction(req.body);
console.log(restriction)
    restriction.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

router.put("/updateuser/:user", (req, res, next) => {
  User.findByIdAndUpdate(req.params.user, req.body).exec(function(err,docs){
    if(err){
            console.log(err);
        }else{

            res.status(200).json({
              data:docs,
              message: "User updated successfully"
                    })
  }
   })
})




router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "Wrong password" });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("w_authExp", user.tokenExp);
                res
                    .cookie("w_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true
                    });
            });
        });
    });
});

router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

module.exports = router;
