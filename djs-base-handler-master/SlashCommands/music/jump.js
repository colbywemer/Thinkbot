const player = require("../../client/player");
const {SlashCommandBuilder} = require("@discordjs/builders");

module.exports = {
    ...new SlashCommandBuilder()
    .setName("jump")
    .setDescription("jumps to specified track")
    .addIntegerOption((option)=>
        option
            .setName("tracknumber")
            .setDescription("the position in the queue the track is in")
            .setRequired(true)
    ),
    run: async (client, interaction, args) => {
        const track = interaction.options.getInteger("tracknumber")
        const queue = player.getQueue(interaction.guildId);
        if (!queue?.playing)
            return interaction.followUp({
                content: "No music is currently being played",
            });
          
            let queueLegnth = queue.tracks.length
            let trackNumber = (track -1)
            if(queueLegnth > trackNumber || trackNumber <= 0){
            let newSong = queue.tracks[trackNumber].title
              queue.jump(trackNumber)
              interaction.followUp(`Jumped to ${newSong}`)
            }
            else{
                interaction.followUp("Invalid track number")
            }
            
            
        
    },
};
