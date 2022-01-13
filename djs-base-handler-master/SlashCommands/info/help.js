const {CommandInteraction, Client, MessageEmbed, MessageButton, MessageActionRow} = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
module.exports = {
    ...new SlashCommandBuilder()
    .setName("help")
    .setDescription("help command for bot")
    .addStringOption((option)=>
    option
        .setName("category")
        .setDescription("test")
        .setRequired(true)
        .addChoice('General', 'general')
		.addChoice('Leveling', 'leveling')
		.addChoice('Moderation', 'moderation')
        .addChoice('Owner', 'owner')
),
   
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const category = interaction.options.getString("category")
        if(category === 'general'){
            const exampleEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('General Commands')
            .addFields(
                {name: 'echo', value: 'Echos your message (if a user is provided it sends them a dirrect messege)'},
                {name: 'userinfo', value: 'Returns your user info (if user is provided, it sends provided users info)'},
                {name: 'serverinfo', value: `Returns the server info`}
            ) 
            .setTimestamp()  
        interaction.followUp({ embeds: [exampleEmbed] });
        }

        if(category === 'leveling'){
            const exampleEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Leveling Commands')
            .addFields(
                {name: 'add', value: 'adds specifed amount of levels/xp to the user provided'},
                {name: 'remove', value: 'removes specified amount of levels/xp from the user provided'},
                {name: 'set', value: 'sets the level/xp of the user provided'},
                {name: 'level', value: `returns the level info of the user provided (if none provided, user that sent the command)`},
                {name: 'leaderboard', value: `returns the top 10 users in the server`}
            ) 
            .setTimestamp()  
        interaction.followUp({ embeds: [exampleEmbed] });
        }
        if(category === 'moderation'){
            const exampleEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Moderation Commands')
            .addFields(
                {name: 'ban', value: 'Bans specified user from server'},
                {name: 'kick', value: 'Kicks specifed user from server'},
                {name: 'mute', value: 'Mutes specified user'},
                {name: 'unban', value: `Unbans specified user from the server(Must use userid)`},
                {name: 'unmute', value: `Unmutes sepcified user`},
                {name: 'clear', value: `clears specifed amount of messages`},
            ) 
            .setTimestamp()  
        interaction.followUp({ embeds: [exampleEmbed] });



        }
        if(category === 'owner'){
            const exampleEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Owner Commands')
            .addFields(
                {name: 'setup', value: `Sets up moderation logs channel and member logs channel`},
                {name: 'custom create', value: `Creates a custom command with the name, description, and response provided`},
                {name: 'custom delete', value: `Deletes a custom command with the name provided`}
            ) 
            .setTimestamp()  
        interaction.followUp({ embeds: [exampleEmbed] });
        }
        }
    }