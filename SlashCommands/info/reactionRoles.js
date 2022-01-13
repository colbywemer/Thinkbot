const {CommandInteraction } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const mongo = require('../../mongo')
const setup = require('../../schemas/setup')
const moment = require("moment")
const reactionSchema = require("../../schemas/reaction-schema");
const { emojis } = require("../..");
module.exports = {
    name: "reaction-role",
    description: "playlist",
    options: [
        {
            name: "add",
            description: "adds songs to playlist",
            type: "SUB_COMMAND",
            options:[
                {
                    name: "channel",
                    description: "Example: song1, song2, ...",
                    type: "CHANNEL",
                    required: true,
                },
                {
                    name: "message-id",
                    description: "Playlist name",
                    type: "STRING",
                    required: true,
                },
                 {
                     name: "emoji",
                     description: "Example: song1, song2, ...",
                     type: "STRING",
                     required: true,
                 },
                {
                    name: "role",
                    description: "Example: song1, song2, ...",
                    type: "STRING",
                    required: true,
                },
            ]
        },
        {
         name: "remove",
         description:"removes songs from playlist",
         type: "SUB_COMMAND",
         options:[
            {
                name: "channel",
                description: "Example: song1, song2, ...",
                type: "CHANNEL",
                required: true,
            },
            {
                name: "message-id",
                description: "Playlist name",
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
        const subCommand = interaction.options.getSubcommand("reaction-role")
        const messageId = interaction.options.getString("message-id")
        let emoji = interaction.options.getString("emoji")
        let role = interaction.options.getString("role")
        let channel = interaction.options.getChannel("channel")
        if(channel.type === 'GUILD_VOICE') return interaction.followUp("Channel can not be a voice channel")
        if(subCommand === "add"){
            role = role.replace(/[^a-zA-Z0-9]/g, '');
            const validRole = interaction.guild.roles.cache.get(role)
            if(!validRole) return interaction.followUp("Invalid role")
            try {
                const message = await channel.messages.fetch(messageId)
                try {
                    message.react(emoji)
                } catch (error) {
                    return interaction.followUp("Invalid emoji")
                }
            } catch (error) {
                return interaction.followUp("Invalid message id")
            }
            await mongo().then(async (mongoose) =>{
                try {
                    let test = await reactionSchema.findOne({guildId: interaction.guildId, emoji, role, messageId, channel: channel.id})
                    if(!test){ await reactionSchema.create({guildId: interaction.guildId, emoji, role, messageId, channel: channel.id})
                    interaction.followUp("Reaction role added")
                }
                    else{await reactionSchema.findOneAndUpdate({guildId: interaction.guildId, emoji, messageId, channel: channel.id},{
                        role
                    })
                    interaction.followUp("Reaction role updated")
                }
                } finally {
                    mongoose.connection.close()
                }
                
            })
            
            

            
        }
        else{
            try {
                const message = await channel.messages.fetch(messageId)
                message.reactions.removeAll()
            } catch (error) {
                return interaction.followUp("Invalid message id") 
            }
                
            await mongo().then(async (mongoose) =>{
                try {
                while (true) {
                            let test = await reactionSchema.findOne({guildId: interaction.guildId, messageId: messageId, channel: channel.id})
                            if(!test) break;
                            await reactionSchema.findOneAndDelete({guildId: interaction.guildId, messageId: messageId, channel: channel.id})
                }
            } finally {
                mongoose.connection.close()
            }
                        
        })
            
            interaction.followUp("Reaction roles removed for spcified message")
        }


    },
};
