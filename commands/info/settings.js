const {
  SlashCommandBuilder,
  setup,
  mongo,
  PermissionFlagsBits,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Allows the server owner to change the guild settings")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Channel you want to update setting for")
        .addChoices(
          {
            name: "Moderation Channel",
            value: "moderationChannel",
          },
          {
            name: "Member Logs Channel",
            value: "memberLogsChannel",
          }
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel you want to set to")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");
    if (type == "moderationChannel") {
      await mongo().then(async (mongoose) => {
        try {
          await setup.findOneAndUpdate(
            {
              _id: interaction.guild.id,
            },
            {
              _id: interaction.guild.id,
              moderationId: channel.id,
            },
            {
              upsert: true,
            }
          );
        } finally {
          mongoose.connection.close();
          interaction.editReply(`Updated Moderation Channel To ${channel}`);
        }
      });
    }
    if (type == "memberLogsChannel") {
      await mongo().then(async (mongoose) => {
        try {
          await setup.findOneAndUpdate(
            {
              _id: interaction.guild.id,
            },
            {
              _id: interaction.guild.id,
              memberId: channel.id,
            },
            {
              upsert: true,
            }
          );
        } finally {
          mongoose.connection.close();
          interaction.editReply(`Updated Members Log Channel To ${channel}`);
        }
      });
    }
  },
};
