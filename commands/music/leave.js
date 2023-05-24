const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("disconnects from the voice channel"),

  async execute(interaction) {
    try {
      let queue = await client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setTitle("I am not currently in a voice channel"),
          ],
        });
      client.distube.stop(interaction);
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Disconnecting From Voice Channel!");
      interaction.editReply({ embeds: [exampleEmbed] });
    } catch (error) {}
  },
};
