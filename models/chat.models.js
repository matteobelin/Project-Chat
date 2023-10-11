const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  content: String

});

const chatModel = mongoose.model('chat', chatSchema);

module.exports = chatModel;