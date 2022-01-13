const { CommandInteractionOptionResolver } = require('discord.js');
const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    guildId: String,
    commandName: String,
    response: [String],
    description: String,
    ownerOnly: Boolean,
    permitedRoles: [String],
});
module.exports = mongoose.model('custom-commands', Schema);