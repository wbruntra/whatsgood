var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  _id : String,
  name: String,
  username: {
      type: String,
      maxlength: 20}
  ,
  blurb: {
    type: String,
    maxlength: 2048}
});

module.exports = mongoose.model('User', UserSchema);
