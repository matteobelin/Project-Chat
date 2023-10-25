const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  pseudo1: String,
  pseudo2:String,
});

const friendModel = mongoose.model('friend', friendSchema);

module.exports = friendModel;