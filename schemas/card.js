const mongoose = require('mongoose');

const reqString= {
    type: String,
    required: true
}

const card = mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  backgroundColor: String,
  backgroundImage: String,
  textColor: String,
  progressbarColor: String,
})
module.exports = mongoose.model('card', card)