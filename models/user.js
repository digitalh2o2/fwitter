const mongoose = require("mongoose");
const validator = require("validator");
const { ObjectID } = require("mongodb");

const _ = require("lodash");
const bcrypt = require("bcryptjs");

let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 1,
    trim: true
  },
  tweets: {
    type: Number,
    count: 0,
    default: 0
  },
  followers: {
    type: Number,
    count: 0,
    default: 0
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
});

UserSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ["_id", "email"]);
};

UserSchema.methods.addFollower = function(err, cb) {
  var user = this;
  User.findOneAndUpdate(
    { _id: user._id },
    { $inc: { followers: 1 } },
    { upsert: true },
    function(err) {
      if (err) {
        console.log(err);
      }
      return cb;
    }
  );
};

UserSchema.pre("save", function(next) {
  var user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

let User = mongoose.model("User", UserSchema);

module.exports = { User };
