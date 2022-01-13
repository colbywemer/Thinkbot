const {CommandInteraction } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const Levels = require('discord-xp');
const { guilds } = require("../..");
module.exports = {
    ...new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("returns leaderboard"),
   
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const rawLeaderboard = await Levels.fetchLeaderboard(interaction.guild.id, 10);
        if(rawLeaderboard.legnth < 1) return interaction.followUp("Nobody is in the leaderboard yet.");
        const leaderboard = await Levels.computeLeaderboard(client, rawLeaderboard, true);
        const lb = leaderboard.map(e => `${e.position}. ${e.username}#${e.discriminator}\nLevel: ${e.level}\nXp: ${e.xp.toLocaleString()}`);
        interaction.followUp(`**Leaderboard**:\n\n${lb.join("\n\n")}`);
    },
};
