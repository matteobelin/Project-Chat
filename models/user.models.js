const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pseudo: String,
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;