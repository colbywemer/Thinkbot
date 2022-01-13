const mongoose = require('mongoose');

const reqString= {
    type: String,
    required: true
}

const ticketSchema = mongoose.Schema({
  guildId: reqString,
 channel: reqString,
 message: reqString,
})
module.exports = mongoose.model('ticket', ticketSchema)