const player = require("../../client/player");
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports = {
    ...new SlashCommandBuilder()
    .setName("seek")
    .setDescription("seeks to a specific time")
    .addIntegerOption((option)=>
        option
            .setName("minutes")
            .setDescription("Minutes you want to skip to")
            .setRequired(true)
    ).addIntegerOption((option)=>
    option
        .setName("seconds")
        .setDescription("Seconds you want to skip to")
        .setRequired(true)
),
    run: async (client, interaction, args) => {
        const minutes = interaction.options.getInteger("minutes")
        const seconds = interaction.options.getInteger("seconds")
        const time = (minutes *60000) + (seconds * 1000)
        const queue = player.getQueue(interaction.guildId);
        if(time <= queue.current.durationMS){
        if (!queue?.playing)
            return interaction.followUp({
                content: "No music is currently being played",
            });
            queue.seek(time) 
            interaction.followUp(`Seeked to ${minutes}:${seconds}`)

        }
        else{interaction.followUp({ content: "time can not be longer than the durration of the song" });}
        
    },
};
