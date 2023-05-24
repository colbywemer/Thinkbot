const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("plays the previous song"),

  async execute(interaction) {
    try {
      let queue = await client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply(
          `There Is Nothing In The Queue Right Now!`
        );
      const song = await queue.previous();
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Playing The Previous Song")
        .setThumbnail(song.thumbnail)
        .addFields({
          name: "Now Playing",
          value: `${song.name} \n${song.url}`,
        });
      interaction.editReply({ embeds: [exampleEmbed] });
    } catch (error) {
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Already At Start Of Queue!");
      interaction.editReply({ embeds: [exampleEmbed] });
    }
  },
};
