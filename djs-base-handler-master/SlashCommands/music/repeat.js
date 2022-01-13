const player = require("../../client/player");
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueueRepeatMode } = require("discord-player");

module.exports = {
    ...new SlashCommandBuilder()
    .setName("loop")
    .setDescription("loops")
    .addIntegerOption((option)=>
    option
        .setName("mode")
        .setDescription("Loop type")
        .addChoice('off', QueueRepeatMode.OFF)
		.addChoice('track', QueueRepeatMode.TRACK)
        .addChoice('queue', QueueRepeatMode.QUEUE)
        .setRequired(true)
),
    run: async (client, interaction, args) => {
        const queue = player.getQueue(interaction.guildId);
        const mode = interaction.options.get("mode").value
        queue.setRepeatMode(mode)
        if(mode == 1){
            interaction.followUp({ content: "Looping track" });
        }
        else if(mode == 2){
            interaction.followUp({ content: "Looping queue" });
        }
        else{
            interaction.followUp({ content: "Loop off" });
        }
        
    },
};
