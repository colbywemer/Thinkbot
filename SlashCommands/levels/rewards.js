const {CommandInteraction, MessageEmbed } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const mongo = require('../../mongo')
const { Mongoose } = require("mongoose");
const rewardsSchema = require('../../schemas/rewards-schema')
module.exports = {
    name: "reward",
   description: "rank rewards",
   options: [
       {
           name: "add",
           description: "adds a rank reward",
           type: "SUB_COMMAND",
           options:[
            {
                name: "level",
                description: "user you want to view the history of",
                type: "INTEGER",
                required: true,
            },
            {
                name: "role",
                description: "role to be given",
                type: "STRING",
                
            }
        ]

       },
       {
        name: "remove",
        description:"removes a rank reward",
        type: "SUB_COMMAND",
        options:[
            {
                name: "level",
                description: "user you want to view the history of",
                type: "INTEGER",
                required: true,
            },
            {
                name: "role",
                description: "role to be given",
                type: "STRING",

            }
        ]

       }, 
   ],

    run: async (client, interaction, args) => {
    
        let role = interaction.options.getString("role");
        const level = interaction.options.getInteger("level");

        role = role.replace(/[^a-zA-Z0-9]/g, '');

        const subCommand = interaction.options.getSubcommand();

        if (subCommand == "add") {
            await mongo().then(async (mongoose) =>{
                try{
                await new rewardsSchema({
                 level: level,
                 role: role,
                 guildId: interaction.guildId
                }).save()
                interaction.followUp("Rank reward added!")
                
        }
        finally{mongoose.connection.close();}
        })
        }
        else{

            await mongo().then(async (mongoose) =>{
                try {
                    const result = await rewardsSchema.findOne({guildId: interaction.guildId, level: level, role: role})
                    if(result)
                    {
                    await rewardsSchema.findOneAndDelete({guildId: interaction.guildId, level: level, role: role})
                    interaction.followUp("Rank reward removed!")
                    }
                    else{
                        interaction.followUp("No rank reward found!")
                    }
                }
        finally{mongoose.connection.close();}
        })
        }

    },
};