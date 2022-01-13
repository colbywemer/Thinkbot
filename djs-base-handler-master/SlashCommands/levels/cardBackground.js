const {CommandInteraction, User, Client, interactionEmbed} = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const ms = require("ms");
const mongo = require('../../mongo');
const validateColor = require('validate-color');
const card = require("../../schemas/card")
module.exports = {
    name: "card-color",
   description: "rank card customazation",
   options: [
       {
           name: "set",
           description: "sets rank card color",
           type: "SUB_COMMAND",
           options:[
            {
                name: "color",
                description: "user you want to view the history of",
                type: "STRING",
                required: true,
            }
        ]

       },
       {
        name: "remove",
        description:"removes rank card color",
        type: "SUB_COMMAND",
       }, 
   ],
    run: async (client, interaction, args) => {
        const subCommand = interaction.options.getSubcommand("card-color")
        if(subCommand == "set"){
            const color = interaction.options.getString("color");
            if(validateColor.validateHTMLColorName(color)||validateColor.validateHTMLColorHex(color)){

                await mongo().then(async (mongoose) =>{
                    try {
                       await card.findOneAndUpdate({guildId: interaction.guildId, userId: interaction.user.id},
                        {guildId: interaction.guildId, userId: interaction.user.id, backgroundColor: color},
                        {upsert: true})
                    } finally {
                        mongoose.connection.close()
                    }
                    
                })
    
                interaction.followUp("Background color updated")
            }
            else{
                interaction.followUp("Please enter a valid color")
            }    
        }
        else{
            await mongo().then(async (mongoose) =>{
                try {
                   await card.findOneAndUpdate({guildId: interaction.guildId, userId: interaction.user.id},
                    {guildId: interaction.guildId, userId: interaction.user.id, $unset: { backgroundColor:""}},
                    {upsert: true})
                    
                } finally {
                    mongoose.connection.close()
                }
                
            })
            interaction.followUp("Background color removed")
        }
        

    }
}