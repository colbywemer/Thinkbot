const {CommandInteraction, MessageEmbed } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require("moment")
const Levels = require('discord-xp')
module.exports = {
    ...new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("displays users info")
    .addUserOption((option)=>
        option
            .setName("target")
            .setDescription("user that you want user info on")
            .setRequired(false)
    ),
    run: async (client, interaction, args) => {
        const user = interaction.options.getUser('target') || interaction.user;
        userId = user.id;
        const target = await Levels.fetch(userId, interaction.guild.id)
        const member = interaction.guild.members.cache.get(user.id)
        const userroles = member.roles.cache.map(r => r.name)
        let status;
        try {
            status = interaction.guild.members.cache.get(user.id).presence.status
        } catch (error) {
            status = "Offline"
        }
        status = status.substring(0,1).toUpperCase() + status.substring(1);


        const exampleEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setAuthor(user.tag, user.avatarURL())
        .setThumbnail(user.avatarURL({dynamic: true}))
        .addFields(
            {name: 'ID', value: `${user.id}`},
            {name: `Roles (${userroles.length - 1} Total)`, value: member.roles.cache.map(role => role.toString()).join(` `).slice(0, -9) || `None`},
            {name: `Level`, value: `${target.level} (${target.xp}/${Levels.xpFor(target.level+1)})`|| `0 (0/100)`},
            {name: `Status`, value: status},
            {name: 'Joined Server', value: `${moment(member.joinedAt).format('MMMM Do YYYY')} at ${moment(member.joinedAt).format('h:mm A')} (${moment(member.joinedAt).startOf(`days`).fromNow()})`},
            {name: 'Joined Discord', value:` ${moment(user.createdTimestamp).format('MMMM Do YYYY')} at ${moment(member.createdTimestamp).format('h:mm A')} (${moment(user.createdTimestamp).startOf(`days`).fromNow()})`},
        ) 
        interaction.followUp({ embeds: [exampleEmbed] });
        
        
        
        
        
    
      
    
    },
};
