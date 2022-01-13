const {CommandInteraction } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const mongo = require('../../mongo')
const setup = require('../../schemas/setup')
const moment = require("moment")
const supportSchema = require("../../schemas/support-schema")
module.exports = {
    ...new SlashCommandBuilder()
    .setName("setup-tickets")
    .setDescription("Allows you to add a ticket system to your server")
    .addChannelOption((option)=>
    option
        .setName("category-id")
        .setDescription("category for the tickets to be created in")
        .setRequired(true)
)
    .addChannelOption((option)=>
    option
        .setName("channel")
        .setDescription("Channel you want the reaction message to be added in")
        .setRequired(true)
        )
        .addStringOption((option)=>
    option
        .setName("reaction-message-text")
        .setDescription("text you want in the reaction message")
        .setRequired(true)
        )
        .addStringOption((option)=>
    option
        .setName("default-ticket-message")
        .setDescription("message that the bot will automatically send when ticket is created")
        .setRequired(false)
),

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
       const category = interaction.options.getChannel('category-id');
        const channel = interaction.options.getChannel('channel');
        const reactionMessage = interaction.options.getString('reaction-message-text');
        const defalultMessage = interaction.options.getString('default-ticket-message')|| null;
       if(interaction.member.id != interaction.guild.ownerId) return interaction.followUp("Only the owner of the server can use this command").then((msg) => {
        setTimeout(() => msg.delete(), ms('5 seconds'))})
        
            if(category.type != "GUILD_CATEGORY") return interaction.followUp("Invalid category")
            if(channel.type != "GUILD_TEXT") return interaction.followUp("Invalid text channel")

        let message = await channel.send(reactionMessage)
        message.react("✅")

            await mongo().then(async (mongoose) =>{
                try {

                    try {
                        const remove = await supportSchema.findOne({guildId: interaction.guildId});
                        const removeChannel = await interaction.guild.channels.cache.get(remove.channel)
                        const removeMessage = await removeChannel.messages.fetch(remove.reactionMessage)
                        removeMessage.delete();
                    } catch (error) {console.log(error)}
                  
                   await supportSchema.findOneAndReplace({
                    guildId: interaction.guild.id},{
                        guildId: interaction.guild.id,
                        category: category.id,
                        reactionMessage: message.id,
                        channel: channel,
                        welcomeMessage: defalultMessage,
                        
                    },{
                        upsert: true
                    })
                   
                } finally {
                    mongoose.connection.close()
                    interaction.followUp(`Updated Ticket Settings`)
                }
                
            })
            


        


    },
};
