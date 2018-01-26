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
  _author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
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

let Tweet = mongoose.model("Tweet", TweetSchema);

module.exports = { Tweet };
