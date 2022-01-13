const {CommandInteraction, User, Client } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const ms = require("ms")
module.exports = {
    ...new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear a specific amount of messages from the channel")
    .addIntegerOption((option)=>
        option
            .setName("amount")
            .setDescription("Amount of messages")
            .setRequired(true)
    ),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if(!interaction.member.permissions.has("MANAGE_MESSAGES")) return interaction.followUp({
            content: "You do not have permission to use this command!"
        }).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
        const amount = interaction.options.getInteger('amount')
        const iterations = Math.floor(amount/99)
        const remainder = amount % 99
        if(amount < 1)
        return interaction.followUp({
            content: "The minimum amount of messages you can delete is 1!"
        }).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
        const messages = await interaction.channel.messages.fetch({
            limit: remainder + 1
        })
        const filtered = await messages.filter(
            (msg) => Date.now() - msg.createdTimestamp < ms("14 days")
        );
        await interaction.channel.bulkDelete(filtered)
        if(iterations > 0){
            const sleep = (milliseconds) => {
                return new Promise(resolve => setTimeout(resolve, milliseconds))
              }
            for (let index = 1; index <= iterations; index++) {
              await sleep(1500)
                const messages = await interaction.channel.messages.fetch({
                    limit: 99
                })
                const filtered = await messages.filter(
                    (msg) => Date.now() - msg.createdTimestamp < ms("14 days")
                );
                await interaction.channel.bulkDelete(filtered)
                
            
            }  
        }
    },
};
