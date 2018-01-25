const mongoose = require("mongoose");
const validator = require("validator");
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

let Tweet = mongoose.model("Tweet", TweetSchema);

module.exports = { Tweet };
