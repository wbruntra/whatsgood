var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true },
  category: String,
  description: String,
  price: String,
  lat: {type: Number, required: true},
  lng: {type: Number, required: true},
  date: { type: Date, default: Date.now },
  createdBy: String,
  creatorId: Number
});

module.exports = mongoose.model('Location', LocationSchema);
