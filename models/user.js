var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  _id : Number,
  name: String,
  username: {
    type: String
  }
});

module.exports = mongoose.model('User', UserSchema);
