const mongoose = require('mongoose'),
 reqString = {
    type: String,
    required: true
}
const playlistSchema = mongoose.Schema({
    name: reqString,
   guildId: reqString,
   songs: [String],
});
module.exports = mongoose.model('playlist', playlistSchema)