const mongoose = require('mongoose');

const reqString= {
    type: String,
    required: true
}

const supportSchema = mongoose.Schema({
  guildId: reqString,
 category: reqString,
 reactionMessage: reqString,
 channel: reqString,
 welcomeMessage: {type: String},

})
module.exports = mongoose.model('support', supportSchema)