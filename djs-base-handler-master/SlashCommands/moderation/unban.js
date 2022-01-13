const {CommandInteraction, MessageEmbed } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const { user, users, guilds } = require("../..");
const mongo = require('../../mongo')
const { Mongoose, get } = require("mongoose");
const userSchema = require('../../schemas/setup');
const caseSchema = require("../../schemas/case-schema");
module.exports = {
    ...new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans Members")
    .addStringOption((option)=>
        option
            .setName("user")
            .setDescription("username#1234 or user ID")
            .setRequired(true)
    )
    .addStringOption((option)=>
        option
            .setName("reason")
            .setDescription("reason for the unban")
            .setRequired(false)
    ),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if(interaction.member.roles.highest.position < 5) return interaction.followUp({
            content: "You do not have permission to use this command!"
        }).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
        let user = interaction.options.getString("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        if(isNaN(user)){
            await mongo().then(async (mongoose) =>{
                const findUser = await caseSchema.findOne({guildId: interaction.guild.id, user: user})
                user = findUser.userId
                mongoose.connection.close();
            })
        }
        interaction.guild.members.unban(user).then(async (user)=>{
            interaction.followUp({
                content: `${user.tag} is unbanned from the server!`,
            }).then((msg) => {
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
            await mongo().then(async (mongoose) =>{
                try {
                    let caseNumber = await caseSchema.find({guildId: interaction.guild.id})
                    let count = caseNumber.length + 1;
                   await new caseSchema({
                       action: "Unban",
                       user: user.tag,
                       userId: user.id,
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
                .setTitle(`Unban - Case #${count}`)
                .addFields(
                {name: 'User', value: `${user.tag}`},
                {name: 'User ID', value: `${user.id}`},
                {name: 'Reason', value: `${reason}`},
                {name: `Moderator`, value: interaction.user.tag},
            ) 
    
                    await channel.send({ embeds: [exampleEmbed1] })
                    }
                }
                finally {mongoose.connection.close()}
            })
            })
        .catch((error)=>{
            console.log(error)
            interaction.followUp({
                content: "Please specify a valid member's id to unban"
            })
           
        })
    },
};
