const mongoose =require( 'mongoose')
const crypto =require( 'crypto')
var random = require('mongoose-simple-random');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name is required'
  },
  email: {
    type: String,
    trim: true,
    unique: 'Email already exists',
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: 'Email is required'
  },
  expertise:String,
  website:String,
  youtube:String,
  promovideos:[String],
  performancedescription:String,
  rates:String,
  hashed_password: {
    type: String,
    required: "Password is required"
  },
  salt: String,
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  },
  about: {
    type: String,
    trim: true
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  ratings: [{type: mongoose.Schema.ObjectId, ref: 'Review'}],
  following: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  followers: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  restrictions: [{type: mongoose.Schema.ObjectId, ref: 'Restriction'}],

  role : {
      type:Number,
      default: 0
  },
  images: [String],
  token : {
      type: String,
  },
  tokenExp :{
      type: Number
  }
})

userSchema.plugin(random)

userSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() {
    return this._password
  })

userSchema.path('hashed_password').validate(function(v) {
  if (this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters.')
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Password is required')
  }
}, null)

userSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },
  encryptPassword: function(password) {
    if (!password) return ''
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt: function() {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  }
}
module.exports = mongoose.model('User', userSchema);
