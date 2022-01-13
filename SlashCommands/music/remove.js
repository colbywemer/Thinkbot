const player = require("../../client/player");
const {SlashCommandBuilder} = require("@discordjs/builders");
module.exports = {
    ...new SlashCommandBuilder()
    .setName("music-remove")
    .setDescription("removes track from queue")
    .addIntegerOption((option)=>
        option
            .setName("tracknumber")
            .setDescription("the position in the queue the track is in")
            .setRequired(true)
    ),
    run: async (client, interaction, args) => {
        const track = interaction.options.getInteger("tracknumber");
        const queue = player.getQueue(interaction.guildId);

        let queueLegnth = queue.tracks.length
        let trackNumber = (track -1)
        if(queueLegnth > trackNumber || trackNumber <= 0){
            queue.remove(trackNumber)
            interaction.followUp("Removed the track from the queue")
        }
        else{
            interaction.followUp("Invalid track number")
        }
    },
};
