const {CommandInteraction, MessageEmbed, Guild } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require("moment")
const ms = require("ms");
module.exports = {
    ...new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("displays the servers info"),
    
    run: async (client, interaction, args) => {
        const userroles =interaction.guild.roles.cache.map(r => r.name)
        const Owner = client.users.cache.get(interaction.guild.ownerId).tag;
        const online = interaction.guild.members.cache.filter(member => member.presence?.status === "online");
        const offline = interaction.guild.members.cache.filter(member => member.presence?.status != "online");
        const dnd = interaction.guild.members.cache.filter(member => member.presence?.status === "dnd");
        const idle = interaction.guild.members.cache.filter(member => member.presence?.status === "idle");
        let tier = interaction.guild.premiumTier
        if(tier === 'NONE'){tier = 0}       
        const exampleEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setAuthor(interaction.guild.name, interaction.guild.iconURL())
        .addFields(
            {name: "Overview", value: `Server Region: ${interaction.guild.preferredLocale} \nOwner: ${Owner} \nBoosts: ${interaction.guild.premiumSubscriptionCount} (Tier ${tier}) \nCreated: ${moment(interaction.guild.createdTimestamp).format('MMMM Do YYYY')} at ${moment(interaction.guild.createdTimestamp).format('h:mm A')}\nOnline: ${online.size + idle.size + dnd.size} \nOffline: ${offline.size - idle.size - dnd.size}`, inline: true},
            {name: `\u200B`, value: `Channels: ${interaction.guild.channels.cache.filter(c => c.type !== 'GUILD_CATEGORY').size} \nText Channels: ${interaction.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').size} \nVoice Channels: ${interaction.guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').size} \nTotal Users: ${interaction.guild.memberCount} \nMembers: ${interaction.guild.members.cache.filter(m=> !m.user.bot).size} \nBots: ${interaction.guild.members.cache.filter(m=> m.user.bot).size}`, inline: true},
            {name: `Roles (${userroles.length - 1})`, value: `${interaction.guild.roles.cache.map(role => role.toString()).join(` `).slice(9) }`|| `None`,}
            ) 
            .setFooter(`ID: ${interaction.guild.id}`)
            .setTimestamp()
        interaction.followUp({ embeds: [exampleEmbed] });
        
    
    },
};
