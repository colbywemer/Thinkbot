const player = require("../../client/player");

module.exports = {
    name: "previous",
    description: "plays the previous song",
    run: async (client, interaction, args) => {
        const queue = player.getQueue(interaction.guildId);
        queue.back()
        console.log(queue.previousTracks)
       

        interaction.followUp({ content: "Playing the previous track" });
    },
};
