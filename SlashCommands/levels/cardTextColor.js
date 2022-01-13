const {CommandInteraction, User, Client, interactionEmbed} = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const ms = require("ms");
const mongo = require('../../mongo');
const validateColor = require('validate-color');
const card = require("../../schemas/card")
module.exports = {
    ...new SlashCommandBuilder()
    .setName("card-text-color")
    .setDescription("sets rank card text color")
    .addStringOption((option) =>
        option
        .setName("color")
        .setDescription("color you want to set the text to be")
        .setRequired(true)
    ),
    run: async (client, interaction, args) => {
        const color = interaction.options.getString("color");
        if(validateColor.validateHTMLColorName(color)||validateColor.validateHTMLColorHex(color)){

            await mongo().then(async (mongoose) =>{
                try {
                   await card.findOneAndUpdate({guildId: interaction.guildId, userId: interaction.user.id},
                    {guildId: interaction.guildId, userId: interaction.user.id, textColor: color},
                    {upsert: true})
                } finally {
                    mongoose.connection.close()
                }
                
            })

            interaction.followUp("Text color updated")
        }
        else{
            interaction.followUp("Please enter a valid color")
        }

    }
}