const mongoose = require("mongoose");
const validator = require("validator");
const { User } = require("./user");
let { ObjectID } = require("mongodb");

let TweetSchema = new mongoose.Schema({
  tweetBody: {
    type: String,
    minlength: 1,
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  favorited: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    required: true
  },
  _author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  comments: [
    {
      body: {
        type: String,
        default: ""
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      commenterName: {
        type: String,
        default: ""
      }
    }
  ]
});

TweetSchema.pre("save", function(next) {
  var tweet = this;
  User.findOneAndUpdate(
    { _id: tweet._author },
    { $inc: { tweets: 1 } },
    { upsert: true },
    function(err) {
      if (err) {
        console.log(err);
      }
      next();
    }
  );
});

TweetSchema.methods.lowerTweets = function(err, cb) {
  var tweet = this;
  User.findOneAndUpdate(
    { _id: tweet._author },
    { $inc: { tweets: -1 } },
    { upsert: true },
    function(err) {
      if (err) {
        console.log(err);
      }
      return cb;
    }
  );
};

TweetSchema.methods.showOwner = function(err, user) {
  var tweet = this;
  User.find({ _id: tweet._author }, function(err) {
    if (err) {
      console.log(err);
    }
    return user;
  });
};

let Tweet = mongoose.model("Tweet", TweetSchema);

module.exports = { Tweet };
