const {CommandInteraction } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const mongo = require('../../mongo')
const setup = require('../../schemas/setup')
const moment = require("moment")
module.exports = {
    ...new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Allows the server owner to change the guild settings")
    .addStringOption((option)=>
    option
        .setName("type")
        .setDescription("Channel you want to update setting for")
        .addChoice('Moderation Channel', 'moderationchannel')
		.addChoice('Member Logs Channel', 'memberlogschannel')
        .setRequired(true)
)
    .addChannelOption((option)=>
    option
        .setName("channel")
        .setDescription("Channel you want to set to")
        .setRequired(true)
        ),

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const type = interaction.options.getString("type");
       const channel = interaction.options.getChannel("channel")
       if(interaction.member.id != interaction.guild.ownerId) return interaction.followUp("Only the owner of the server can use this command").then((msg) => {
        setTimeout(() => msg.delete(), ms('5 seconds'))})
        if(type == 'moderationchannel'){
            await mongo().then(async (mongoose) =>{
                try {
                   await setup.findOneAndUpdate({
                        _id: interaction.guild.id},{
                            _id: interaction.guild.id,
                            moderationId: channel.id,
                            lastUpdated:`${moment(Date.now()).format('MMMM Do YYYY')} at ${moment(Date.now()).format('h:mm A')}`
                        },{
                            upsert: true
                        }
     
     
     
                    )
                } finally {
                    mongoose.connection.close()
                    interaction.followUp(`Updated Moderation Channel To ${channel}`)
                }
                
            })
            


        }
        if(type == "memberlogschannel"){
await mongo().then(async (mongoose) =>{
                try {
                   await setup.findOneAndUpdate({
                        _id: interaction.guild.id},{
                            _id: interaction.guild.id,
                             memberId: channel.id,
                             lastUpdated:`${moment(Date.now()).format('MMMM Do YYYY')} at ${moment(Date.now()).format('h:mm A')}`
                        },{
                            upsert: true
                        }
     
     
     
                    )
                } finally {
                    mongoose.connection.close()
                    interaction.followUp(`Updated Members Log Channel To ${channel}`)
                }
                
            })
            



        }


    },
};
