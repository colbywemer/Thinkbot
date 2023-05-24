const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("jumps to specified track")
    .addIntegerOption((option) =>
      option
        .setName("tracknumber")
        .setDescription("the position in the queue the track is in")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    try {
      const track = interaction.options.getInteger("tracknumber");
      let queue = await client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply(
          `There Is Nothing In The Queue Right Now!`
        );
      if (queue.songs.length > track) {
        const song = await queue.jump(track);
        exampleEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Jumping To Track")
          .setThumbnail(song.thumbnail)
          .addFields({
            name: "Now Playing",
            value: `${song.name} \n${song.url}`,
          });

        interaction.editReply({ embeds: [exampleEmbed] });
      } else {
        exampleEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Invalid Track Number!");
        interaction.editReply({ embeds: [exampleEmbed] });
      }
    } catch (error) {}
  },
};
