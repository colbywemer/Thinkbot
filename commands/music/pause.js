const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("pause the music"),

  async execute(interaction) {
    try {
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return interaction.editReply("Please join a voice channel first!");
      }
      let queue = await client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply(
          `There Is Nothing In The Queue Right Now!`
        );
      await queue.pause();
      const exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Paused The Music");
      interaction.editReply({ embeds: [exampleEmbed] });
    } catch (error) {
      interaction.editReply("An error occurred!");
    }
  },
};
