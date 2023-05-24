const {
  SlashCommandBuilder,
  mongo,
  rewardsSchema,
  PermissionFlagsBits,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reward")
    .setDescription("rank rewards")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("adds a rank reward")
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("level at which the reward will be given")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("role")
            .setDescription("role to be given as the reward")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("removes a rank reward")
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("level of the reward to be removed")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("role")
            .setDescription("role to be removed as the reward")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    let role = interaction.options.getString("role");
    const level = interaction.options.getInteger("level");

    role = role.replace(/[^a-zA-Z0-9]/g, "");

    const subCommand = interaction.options.getSubcommand();

    if (subCommand == "add") {
      await mongo().then(async (mongoose) => {
        try {
          await new rewardsSchema({
            level: level,
            role: role,
            guildId: interaction.guildId,
          }).save();
          interaction.editReply("Rank reward added!");
        } finally {
          mongoose.connection.close();
        }
      });
    } else {
      await mongo().then(async (mongoose) => {
        try {
          const result = await rewardsSchema.findOne({
            guildId: interaction.guildId,
            level: level,
            role: role,
          });
          if (result) {
            await rewardsSchema.findOneAndDelete({
              guildId: interaction.guildId,
              level: level,
              role: role,
            });
            interaction.editReply("Rank reward removed!");
          } else {
            interaction.editReply("No rank reward found!");
          }
        } finally {
          mongoose.connection.close();
        }
      });
    }
  },
};
