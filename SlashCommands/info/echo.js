const {CommandInteraction} = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const { user } = require("../..");
module.exports = {
    ...new SlashCommandBuilder()
    .setName("echo")
    .setDescription("echo's your message")
    .addStringOption((option)=>
        option
            .setName("message")
            .setDescription("message that you want to echo")
            .setRequired(true)
    )
    .addUserOption((option)=>
        option
            .setName("target")
            .setDescription("user to send message to")
            .setRequired(false)
    ),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const messageToSend = interaction.options.getString('message');
        const user = interaction.options.getUser('target');
       const userroles = interaction.member.roles.cache.map(r => r.name)  
       
        if(!interaction.member.permissions.has("MANAGE_MESSAGES")) return interaction.followUp({
            content: "You do not have permission to use this command!"
        }).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
        if(user){
            user.send({content: messageToSend});
            interaction.followUp({
                content: `I sent the message to ${user.tag}`,
            }).then((msg) => {
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
        }
        else{
        interaction.followUp({content: messageToSend})
        }
    },
};
