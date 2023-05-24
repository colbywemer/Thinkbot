const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music-remove")
    .setDescription("removes track from queue")
    .addIntegerOption((option) =>
      option
        .setName("tracknumber")
        .setDescription("the position in the queue the track is in")
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction) {
    const track = interaction.options.getInteger("tracknumber");
    try {
      let queue = await client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply(
          `There Is Nothing In The Queue Right Now!`
        );
      await queue.songs.splice(track, 1);
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Removed Track From Queue");

      interaction.editReply({ embeds: [exampleEmbed] });
    } catch (error) {}
  },
};
