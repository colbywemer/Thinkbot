const mongoose = require('mongoose');

const reqString= {
    type: String,
    required: true
}

const setup = mongoose.Schema({
  _id: reqString,
  moderationId: {type: String},
  memberId: {type: String},
  musicManagment: [String],
  dj: [String],
  musicId: [String],
  lastUpdated:{type: String}

})
module.exports = mongoose.model('setup', setup)