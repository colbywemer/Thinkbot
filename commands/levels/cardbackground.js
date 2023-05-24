const {
  SlashCommandBuilder,
  mongo,
  validateColor,
  card,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("card-color")
    .setDescription("rank card customization")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("sets rank card color")
        .addStringOption((option) =>
          option
            .setName("color")
            .setDescription("color of the card")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("remove").setDescription("removes rank card color")
    ),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand("card-color");
    if (subCommand == "set") {
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
                backgroundColor: color,
              },
              {
                upsert: true,
              }
            );
          } finally {
            mongoose.connection.close();
          }
        });

        interaction.editReply("Background color updated");
      } else {
        interaction.editReply("Please enter a valid color");
      }
    } else {
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
              $unset: {
                backgroundColor: "",
              },
            },
            {
              upsert: true,
            }
          );
        } finally {
          mongoose.connection.close();
        }
      });
      interaction.editReply("Background color removed");
    }
  },
};
