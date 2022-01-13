const {CommandInteraction } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const mongo = require('../../mongo')
const moment = require("moment");
const blacklistSchema = require("../../schemas/blacklist-schema");
module.exports = {
    name: "blacklist",
    description: "automod blacklist",
    options: [
        {
            name: "list",
            description: "lists blacklisted words",
            type: "SUB_COMMAND",
        },
        {
            name: "add",
            description: "adds words to the blacklist",
            type: "SUB_COMMAND",
            options:[
                {
                    name: "words",
                    description: "Example: word1, word2, ...",
                    type: "STRING",
                    required: true,
                },
            ],
        },
        {
         name: "remove",
         description:"removes words from the blacklist",
         type: "SUB_COMMAND",
         options:[
             {
                 name: "words",
                 description: "Example: word1, word2, ...",
                 type: "STRING",
                 required: true,
             },
         ]
 
        },
    ],

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const subCommand = interaction.options.getSubcommand();
        const words = interaction.options.getString("words");
       if(interaction.member.id != interaction.guild.ownerId) return interaction.followUp("Only the owner of the server can use this command").then((msg) => {
        setTimeout(() => msg.delete(), ms('5 seconds'))})
        if(subCommand == "add"){
            let wordsSplit = words.split(",");
            for (let index = 0; index < wordsSplit.length; index++) {
                const element = wordsSplit[index];
                let word = element.trim().toLowerCase();

                await mongo().then(async (mongoose) =>{
                    try {
                        const wordExist = await blacklistSchema.findOne({guildId: interaction.guildId})
                        if(!wordExist){
                        await blacklistSchema.create({guildId: interaction.guildId, word})
                        }   
                        else{
                            await blacklistSchema.findOneAndUpdate({guildId: interaction.guildId},{
                                $addToSet:{
                                    word
                                }
                            })
                        }
                    } finally {
                        mongoose.connection.close()
                    }
                    
                })
                
            }
            if(wordsSplit.length > 1) interaction.followUp("Words added to blacklist")
            else interaction.followUp("Word added to blacklist")
        }
        if (subCommand == 'list') {
            await mongo().then(async (mongoose) =>{
                try {
                   let listWords = await blacklistSchema.findOne({guildId: interaction.guildId})
                    let output = "";
                    for (let index = 0; index < listWords.word.length; index++) {
                        let word = listWords.word[index];
                        if(index < listWords.word.length - 1){
                        output += word + ", ";
                        }
                        else{
                            output += word;
                        }
                    }
                   interaction.followUp("Blacklisted words: " + output)
                } finally {
                    mongoose.connection.close()
                }
                
            })
        }
        if(subCommand == 'remove'){
            let wordsSplit = words.split(",");
            for (let index = 0; index < wordsSplit.length; index++) {
                const element = wordsSplit[index];
                await mongo().then(async (mongoose) =>{
                    try {
                        await blacklistSchema.findOneAndUpdate({guildId: interaction.guild.id},{
                            $pull:{
                                word: element.trim().toLowerCase()
                            }
                        })
                    } finally {
                        mongoose.connection.close()
                    }
                    
                })
    
            }   
            if(wordsSplit.length > 1) interaction.followUp("Words removed from blacklist")
            else interaction.followUp("Word removed from blacklist")
        }
       


    },
};
