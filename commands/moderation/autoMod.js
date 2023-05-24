const {
  SlashCommandBuilder,
  mongo,
  setup,
  PermissionFlagsBits,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("auto mod settings")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("blacklist-words")
        .setDescription(
          "toggles blacklisted words being counting towards infraction count"
        )
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription(
              "Toggles blacklisted words being counting towards infraction count"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("mention-spam")
        .setDescription(
          "Toggles mention spam being counting towards infraction count"
        )
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription(
              "Toggles mention spam being counting towards infraction count"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("message-spam")
        .setDescription(
          "Toggles message spam being counting towards infraction count"
        )
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription(
              "Toggles message spam being counting towards infraction count"
            )
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    const enabled = interaction.options.getBoolean("enabled");
    switch (subCommand) {
      case "blacklist-words":
        await mongo().then(async (mongoose) => {
          try {
            await setup.findOneAndUpdate(
              {
                _id: interaction.guild.id,
              },
              {
                _id: interaction.guild.id,
                blacklist: enabled,
              },
              {
                upsert: true,
              }
            );
          } finally {
            mongoose.connection.close();
          }
        });
        break;
      case "mention-spam":
        await mongo().then(async (mongoose) => {
          try {
            await setup.findOneAndUpdate(
              {
                _id: interaction.guild.id,
              },
              {
                _id: interaction.guild.id,
                mention: enabled,
              },
              {
                upsert: true,
              }
            );
          } finally {
            mongoose.connection.close();
          }
        });
        break;
      case "message-spam":
        await mongo().then(async (mongoose) => {
          try {
            await setup.findOneAndUpdate(
              {
                _id: interaction.guild.id,
              },
              {
                _id: interaction.guild.id,
                message: enabled,
              },
              {
                upsert: true,
              }
            );
          } finally {
            mongoose.connection.close();
          }
        });
        break;
    }
    interaction.editReply(
      `Updated AutoMod Settings For "${subCommand}" to "${enabled}"!`
    );
  },
};
