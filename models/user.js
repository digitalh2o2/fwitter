const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

let UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 1,
    trim: true
  },
  lastName: {
    type: String,
    minlength: 1,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
});

let User = mongoose.model("User", UserSchema);

module.exports = { User };
