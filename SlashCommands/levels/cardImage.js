const {CommandInteraction, MessageEmbed } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const mongo = require('../../mongo')
const { Mongoose } = require("mongoose");
const rewardsSchema = require('../../schemas/rewards-schema')
const isImageURL = require('image-url-validator').default;
const card = require("../../schemas/card")
module.exports = {
    name: "card-background",
   description: "rank rewards",
   options: [
       {
           name: "set",
           description: "adds rank card image",
           type: "SUB_COMMAND",
           options:[
            {
                name: "image-url",
                description: "user you want to view the history of",
                type: "STRING",
                required: true,
            }
        ]

       },
       {
        name: "remove",
        description:"removes rank card image",
        type: "SUB_COMMAND",
       }, 
   ],
   run: async (client, interaction, args) => {
    const subCommand = interaction.options.getSubcommand("card-background")
    if(subCommand == "set"){
        const image = interaction.options.getString("image-url");
        isImageURL(image).then(async is_image => {
            if(is_image){
                await mongo().then(async (mongoose) =>{
                    try {
                       await card.findOneAndUpdate({guildId: interaction.guildId, userId: interaction.user.id},
                        {guildId: interaction.guildId, userId: interaction.user.id, backgroundImage: image},
                        {upsert: true})
                    } finally {
                        mongoose.connection.close()
                    }
                    
                })
                interaction.followUp("Background image updated")
            }
            else{interaction.followUp("Please enter a valid image url")}
        });
       


    }
    else{
        await mongo().then(async (mongoose) =>{
            try {
               await card.findOneAndUpdate({guildId: interaction.guildId, userId: interaction.user.id},
                {guildId: interaction.guildId, userId: interaction.user.id, $unset: { backgroundImage:""}},
                {upsert: true})
                
            } finally {
                mongoose.connection.close()
            }
            
        })
        interaction.followUp("Background image removed")
    }

}
}