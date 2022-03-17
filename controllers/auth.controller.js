const User =require( '../models/user.model')
const jwt =require( 'jsonwebtoken')
const expressJwt =require( 'express-jwt')
const config =require( './../config/config')

const signin = async (req, res) => {
  try {
    let user = await User.findOne({
      "email": { $regex: new RegExp(req.body.email, "i") }
    }).populate('recentprivatemessages')
    console.log("user")
console.log(user)
    if (!user)
      return res.status('401').json({
        error: "User not found"
      })

    if (!user.authenticate(req.body.password)) {
      return res.status('401').send({
        error: "Email and password don't match."
      })
    }

    var d = new Date();
    var n = d.getTime();
await User.findByIdAndUpdate(user._id,{$push: {signins: n}}).exec(function(err,docs){
  if(err){
          console.error(err);
      }else{

        console.log(docs)
}
 })

    const token = jwt.sign({
      _id: user._id
    }, config.jwtSecret)

    res.cookie("t", token, {
      expire: new Date() + 9999
    })

    return res.json({
      token,
      user: {_id: user._id,approvedmember:user.approvedmember, name: user.name,cool:user.cool,coordinates:user.coordinates, email: user.email,events:user.events,
        leads:user.leads,posts:user.posts,polls:user.polls,rules:user.rules,purchases:user.purchases,
        restriction:user.restriction,rulesapproved:user.rulesapproved,restrictionsapproved:user.restrictionsapproved,
        recentprivatemessages:user.recentprivatemessages}
    })
  } catch (err) {
    console.error(err)
    return res.status('401').json({
      error: "Could not sign in"
    })

  }
}

const signout = (req, res) => {
  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth'
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

module.exports= {
  signin,
  signout,
  requireSignin,
  hasAuthorization
}
