const {
  SlashCommandBuilder,
  mongo,
  validateColor,
  card,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("card-text-color")
    .setDescription("sets rank card text color")
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("color you want to set the text to be")
        .setRequired(true)
    ),

  async execute(interaction) {
    const color = interaction.options.getString("color");
    if (
      validateColor.validateHTMLColorName(color) ||
      validateColor.validateHTMLColorHex(color)
    ) {
      await mongo().then(async (mongoose) => {
        try {
          await card.findOneAndUpdate(
            {
              guildId: interaction.guildId,
              userId: interaction.user.id,
            },
            {
              guildId: interaction.guildId,
              userId: interaction.user.id,
              textColor: color,
            },
            {
              upsert: true,
            }
          );
        } finally {
          mongoose.connection.close();
        }
      });

      interaction.editReply("Text color updated");
    } else {
      interaction.editReply("Please enter a valid color");
    }
  },
};
