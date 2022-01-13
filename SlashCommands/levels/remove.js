const {CommandInteraction, User, Client, MessageEmbed} = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const ms = require("ms");
const Levels = require('discord-xp')
module.exports = {
    ...new SlashCommandBuilder()
    .setName("remove")
    .setDescription("remove command for leveling system")
    .addUserOption((option) =>
        option
        .setName("user")
        .setDescription("user")
        .setRequired(true)
    )
    .addStringOption((option) =>
        option
        .setName("type")
        .setDescription("choose whether you want to set xp or level")
        .setRequired(true)
        .addChoice('Xp', 'xp')
        .addChoice('Level', 'level')

    )
    .addIntegerOption((option) =>
        option
        .setName("amount")
        .setDescription("amount you want to add to it")
        .setRequired(true)
    ),
    run: async (client, interaction, args) => {
        const user = interaction.options.getUser("user")
        const type = interaction.options.getString("type")
        const value = interaction.options.getInteger("amount");
        const levelUser = await Levels.fetch(user.id, interaction.guild.id)
        if(!levelUser) return interaction.followUp(`${user.tag} is not in the database!`)
        if(value < 1) return interaction.followUp("You need to insert a value greater than 0!")
        if(type == 'xp'){
            if(levelUser.xp < value) return interaction.followUp("You can not remove more xp than the user has!")
            await Levels.subtractXp(user.id, interaction.guild.id, value)
            interaction.followUp(`Subtracted ${value} xp from ${user.tag}`)
        }
        if(type == 'level'){
            if(levelUser.level < value) return interaction.followUp("You can not remove more levels than the user has!")
            await Levels.subtractLevel(user.id, interaction.guild.id, value)
            interaction.followUp(`Subtracted ${value} level(s) from ${user.tag}`)
        }

    }
}