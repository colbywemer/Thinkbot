const mongoose = require('mongoose'),
 reqString = {
    type: String,
    required: true
}
const caseSchema = mongoose.Schema({
    action: reqString,
    user: reqString,
    userId: reqString,
    guildId: reqString,
    reason: reqString,
    staffTag: reqString,
    duration: String,
    case: Number,
    expires: Date,
    current: Boolean,
    auto: Boolean,
    resolved: Boolean,
},{
    timestamps: true,
});
module.exports = mongoose.model('case', caseSchema)