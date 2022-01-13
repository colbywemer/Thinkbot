const {CommandInteraction, MessageEmbed } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const mongo = require('../../mongo')
const { Mongoose } = require("mongoose");
const userSchema = require('../../schemas/setup');
const caseSchema = require("../../schemas/case-schema");
module.exports = {
    ...new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("unmutes Member")
    .addUserOption((option)=>
        option
            .setName("target")
            .setDescription("Target To Unmute")
            .setRequired(true)
    )
    .addStringOption((option)=>
        option
            .setName("reason")
            .setDescription("reason for the unmute")
            .setRequired(false)
    ),
  
    run: async (client, interaction, args) => {
        const target = interaction.options.getMember("target");
        const reason = interaction.options.getString("reason") || "No reason provided";
            if(!interaction.member.permissions.has("KICK_MEMBERS")) return interaction.followUp({
                content: "You do not have permission to use this command!"
            }).then((msg) => {
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
            if(interaction.member.id != interaction.guild.ownerId){
            if(interaction.member.roles.highest.position <= target.roles.highest.position) return interaction.followUp({
                content: "You are not able to unmute someone with a higher role than you!"
            }).then((msg) => {
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
        }
        let muteRole = interaction.guild.roles.cache.find(role => role.name === "Muted")
        if(!target.roles.cache.has(muteRole.id)) return interaction.followUp({
            content: "The user is not muted!"
        }).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
        target.roles.remove(muteRole.id.toString()).then(() => {
            interaction.followUp({
                content: `Unmuted ${target.user.tag} successfully!`
            }).then((msg)=>{
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
        })

        await mongo().then(async (mongoose) =>{
            try {
               await caseSchema.findOneAndUpdate({
                    guildId: interaction.guild.id,
                    userId: target.id,
                    current: true
                },{
                    current: false
                    },{
                        upsert: true
                    }
                )
            } finally {
                mongoose.connection.close()
            }
            
        })

        await mongo().then(async (mongoose) =>{
            try {
                let caseNumber = await caseSchema.find({guildId: interaction.guild.id})
                 let count = caseNumber.length + 1;
                await new caseSchema({
                    action: "Unmute",
                    user: target.user.tag,
                    userId: target.id,
                    guildId: interaction.guild.id,
                    reason,
                    staffTag: interaction.user.tag,
                    case: count,
                    auto: false,
                    resolved: false,
                }).save()



                const result = await userSchema.findOne({_id: interaction.guild.id})
                if(result){
                let channelId = result.moderationId
                let channel = interaction.guild.channels.cache.get(channelId)

                const exampleEmbed1 = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Unmute - Case #${count}`)
            .addFields(
            {name: 'User', value: `${target.user.tag}`},
            {name: 'User ID', value: `${target.id}`},
            {name: 'Reason', value: `${reason}`},
            {name: `Moderator`, value: interaction.user.tag},
        ) 

                await channel.send({ embeds: [exampleEmbed1] })
                }
            }
            finally {mongoose.connection.close()}
        })
    },
};
