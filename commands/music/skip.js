const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skips the current song"),

  async execute(interaction) {
    try {
      let queue = await client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply(
          `There Is Nothing In The Queue Right Now!`
        );
      const song = await queue.skip();
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Skipping Current Song")
        .setThumbnail(song.thumbnail)
        .addFields({
          name: "Now Playing",
          value: `${song.name} \n${song.url}`,
        });

      interaction.editReply({ embeds: [exampleEmbed] });
    } catch (error) {
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Already At End Of Queue! Use Leave Command Instead!");
      interaction.editReply({ embeds: [exampleEmbed] });
    }
  },
};
