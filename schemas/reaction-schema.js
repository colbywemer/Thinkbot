const mongoose = require('mongoose'),
 reqString = {
    type: String,
    required: true
}
const reactionSchema = mongoose.Schema({
   channel: reqString,
   messageId: reqString,
   emoji: reqString,
   role: reqString,
   guildId: reqString,
});
module.exports = mongoose.model('reaction roles', reactionSchema)