const mongoose = require('mongoose'),
 reqString = {
    type: String,
    required: true
}
const rewardsSchema = mongoose.Schema({
   level: reqString,
   role: reqString,
   guildId: reqString,
});
module.exports = mongoose.model('rewards', rewardsSchema)