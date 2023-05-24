const {
  SlashCommandBuilder,
  mongo,
  isImageURL,
  card,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("card-background")
    .setDescription("rank rewards")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("adds rank card image")
        .addStringOption((option) =>
          option
            .setName("image-url")
            .setDescription("url of the image to be set as the card background")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("remove").setDescription("removes rank card image")
    ),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand("card-background");
    if (subCommand == "set") {
      const image = interaction.options.getString("image-url");
      isImageURL(image).then(async (is_image) => {
        if (is_image) {
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
                  backgroundImage: image,
                },
                {
                  upsert: true,
                }
              );
            } finally {
              mongoose.connection.close();
            }
          });
          interaction.editReply("Background image updated");
        } else {
          interaction.editReply("Please enter a valid image url");
        }
      });
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
                backgroundImage: "",
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
      interaction.editReply("Background image removed");
    }
  },
};
