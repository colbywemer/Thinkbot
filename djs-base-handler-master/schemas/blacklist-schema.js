const mongoose = require('mongoose'),
 reqString = {
    type: String,
    required: true
}
const blacklistSchema = mongoose.Schema({
    word: [String],
    whitelistedChannels: [String],
    whitelistedRoles: [String],
    guildId: reqString,
  
});
module.exports = mongoose.model('blacklist', blacklistSchema)