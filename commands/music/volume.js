const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("sets music volume")
    .addIntegerOption((option) =>
      option
        .setName("percent")
        .setDescription("percentage you want to set the volume to")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    const volume = interaction.options.getInteger("percent");
    let queue = await client.distube.getQueue(interaction);
    queue.setVolume(volume);

    exampleEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle(`Volume Changed To ${volume}%`);
    interaction.editReply({ embeds: [exampleEmbed] });
  },
};
