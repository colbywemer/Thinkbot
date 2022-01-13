const {CommandInteraction, MessageEmbed } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const mongo = require('../../mongo')
const moment = require("moment");
const blacklistSchema = require("../../schemas/blacklist-schema");
module.exports = {
    name: "whitelist",
    description: "roles and channels automod ignores",
    options: [
        {
            name: "list",
            description: "lists roles and channels for automod to ignore",
            type: "SUB_COMMAND",
        },
        {
            name: "add-roles",
            description: "adds roles for automod to ignore",
            type: "SUB_COMMAND",
            options:[
                {
                    name: "roles",
                    description: "Example: @role1 @role2, ...",
                    type: "STRING",
                    required: true,
                },
            ],
        },
        {
         name: "remove-roles",
         description:"removes roles for automod to ignore",
         type: "SUB_COMMAND",
         options:[
             {
                 name: "roles",
                 description: "Example: @role1 @role2, ...",
                 type: "STRING",
                 required: true,
             },
         ]
 
        },
        {
            name: "add-channels",
            description: "adds channels for automod to ignore",
            type: "SUB_COMMAND",
            options:[
                {
                    name: "channels",
                    description: "Example: #channel1 #channel2, ...",
                    type: "STRING",
                    required: true,
                },
            ],
        },
        {
         name: "remove-channels",
         description:"removes channels for automod to ignore",
         type: "SUB_COMMAND",
         options:[
             {
                 name: "channels",
                 description: "Example: #channel1 #channel2, ...",
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
        await mongo().then(async (mongoose) =>{
            try {
                if(subCommand === "list"){
                    let list = await blacklistSchema.findOne({guildId: interaction.guildId})
                    let channels = ""
                    let roles = ""
                    for (let index = 0; index < list.whitelistedChannels.length; index++) {
                        let currentChannel = interaction.guild.channels.cache.get(list.whitelistedChannels[index])
                        if(currentChannel){
                            channels += currentChannel.name
                            if(index != list.whitelistedChannels.length - 1){
                                channels += ", "
                            }
                        }
                       
                    }
                    for (let index = 0; index < list.whitelistedRoles.length; index++) {
                        let currentRole = interaction.guild.roles.cache.get(list.whitelistedRoles[index])
                        if(currentRole){
                            roles += currentRole.name
                            if(index != list.whitelistedRoles.length - 1){
                                roles += ", "
                            }
                        }
                       
                    }
                    if(roles == "") roles = "None"
                    if(channels == "") channels = "None"

                    const exampleEmbed1 = new MessageEmbed()
                    .addFields(
                        {name: 'Roles Automod Ignores', value: roles},
                        {name: 'Channels Automod Ignores', value: channels},
                    ) 
                    .setColor('#FF0000')
                    await interaction.followUp({ embeds: [exampleEmbed1] })
                    
                }
                if(subCommand === "add-roles"){
                    let hasRole = false
                    const roles = interaction.options.getString("roles")
                    let splitRoles = roles.split("@")
                    for (let index = 0; index < splitRoles.length; index++) {
                        let role = splitRoles[index].replace(/[^a-zA-Z0-9]/g, '').trim();
                        let searchRole = interaction.guild.roles.cache.get(role)
                        if(searchRole){
                            hasRole = true
                            await blacklistSchema.findOneAndUpdate({guildId: interaction.guildId},{
                                guildId: interaction.guildId,
                                $addToSet:{    
                                    whitelistedRoles: role
                                }
                            },{upsert: true})
                        }
                    }
                    if(hasRole) interaction.followUp("Roles are now being ignored by automod")
                    else interaction.followUp("Please enter a valid role")
                }
                if(subCommand === "remove-roles"){
                    const roles = interaction.options.getString("roles")
                    let splitRoles = roles.split("@")
                    for (let index = 0; index < splitRoles.length; index++) {
                        let role = splitRoles[index].replace(/[^a-zA-Z0-9]/g, '').trim();
                            await blacklistSchema.findOneAndUpdate({guildId: interaction.guildId},{
                                guildId: interaction.guildId,
                                $pull:{    
                                    whitelistedRoles: role
                                }
                            },{upsert: true})
                    }
                    interaction.followUp("Roles are no longer being ignored by automod")
                }
                if(subCommand === "add-channels"){
                    const channels = interaction.options.getString("channels")
                    let hasChannel = false
                    let splitChannels = channels.split("#")
                    for (let index = 0; index < splitChannels.length; index++) {
                        let channel = splitChannels[index].replace(/[^a-zA-Z0-9]/g, '').trim();
                        let searchChannel = interaction.guild.channels.cache.get(channel)
                        if(searchChannel){
                            hasChannel = true
                            await blacklistSchema.findOneAndUpdate({guildId: interaction.guildId},{
                                guildId: interaction.guildId,
                                $addToSet:{    
                                    whitelistedChannels: channel
                                }
                            },{upsert: true})
                        }
                    }
                    if(hasChannel) interaction.followUp("Channels are now being ignored by automod")
                    else interaction.followUp("Please enter a valid channel")
                }
                if(subCommand === "remove-channels"){
                    const channels = interaction.options.getString("channels")
                    let splitChannels = channels.split("#")
                    for (let index = 0; index < splitChannels.length; index++) {
                        let channel = splitChannels[index].replace(/[^a-zA-Z0-9]/g, '').trim();
                            await blacklistSchema.findOneAndUpdate({guildId: interaction.guildId},{
                                guildId: interaction.guildId,
                                $pull:{    
                                    whitelistedChannels: channel
                                }
                            },{upsert: true})
                    }
                    interaction.followUp("Channels are no longer being ignored by automod")
            
                }
               
            } finally {
                mongoose.connection.close()
            }
            
        })


        
       
    },
};
