const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("set repeat mode")
    .addIntegerOption((option) =>
      option
        .setName("mode")
        .setDescription("Loop type")
        .addChoices(
          { name: "Off", value: 0 },
          { name: "Track", value: 1 },
          { name: "Queue", value: 2 }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const mode = interaction.options.getInteger("mode");
      let queue = await client.distube.getQueue(interaction);
      let repeat = "Off";
      if (!queue)
        return interaction.editReply(
          `There Is Nothing In The Queue Right Now!`
        );
      if (mode == 1) repeat = "Track";
      else if (mode == 2) repeat = "Queue";
      await queue.setRepeatMode(mode);
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`Set Repeat Mode To "${repeat}"`);

      interaction.editReply({ embeds: [exampleEmbed] });
    } catch (error) {}
  },
};
