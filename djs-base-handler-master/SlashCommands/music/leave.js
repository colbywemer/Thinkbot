const player = require("../../client/player");

module.exports = {
    name: "leave",
    description: "disconects from the voice channel",
    run: async (client, interaction) => {
        const queue = player.getQueue(interaction.guildId);
       try {
        queue.destroy(true);
        interaction.followUp("Disconecting from voice channel")
       } catch (error) {
           interaction.followUp("I am not currently in a voice channel")
       }
       
    },
};
