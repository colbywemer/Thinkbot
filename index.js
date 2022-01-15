const { Client, Collection } = require("discord.js");

const client = new Client({
    intents: 32767,
    partials: ['USER', 'REACTION', 'MESSAGE']
});
module.exports = client;

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./config.json");

// Initializing the project
require("./handler")(client);

console.log(client.config.token)
client.login(client.config.token);
