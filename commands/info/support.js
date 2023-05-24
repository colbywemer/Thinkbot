const {
  SlashCommandBuilder,
  mongo,
  supportSchema,
  PermissionFlagsBits,
  ChannelType,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-tickets")
    .setDescription("Allows you to add a ticket system to your server")
    .addChannelOption((option) =>
      option
        .setName("category-id")
        .setDescription("category for the tickets to be created in")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel you want the reaction message to be added in")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reaction-message-text")
        .setDescription("text you want in the reaction message")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("default-ticket-message")
        .setDescription(
          "message that the bot will automatically send when ticket is created"
        )
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const category = interaction.options.getChannel("category-id");
    const channel = interaction.options.getChannel("channel");
    const reactionMessage = interaction.options.getString(
      "reaction-message-text"
    );
    const defaultMessage =
      interaction.options.getString("default-ticket-message") || null;
    if (category.type != ChannelType.GuildCategory)
      return interaction.editReply("Invalid category");
    if (channel.type != ChannelType.GuildText)
      return interaction.editReply("Invalid text channel");

    let message = await channel.send(reactionMessage);
    message.react("✅");

    await mongo().then(async (mongoose) => {
      try {
        try {
          const remove = await supportSchema.findOne({
            guildId: interaction.guildId,
          });
          const removeChannel = await interaction.guild.channels.cache.get(
            remove.channel
          );
          const removeMessage = await removeChannel.messages.fetch(
            remove.reactionMessage
          );
          removeMessage.delete();
        } catch (error) {
          console.log(error);
        }

        await supportSchema.findOneAndReplace(
          {
            guildId: interaction.guild.id,
          },
          {
            guildId: interaction.guild.id,
            category: category.id,
            reactionMessage: message.id,
            channel: channel,
            welcomeMessage: defaultMessage,
          },
          {
            upsert: true,
          }
        );
      } finally {
        mongoose.connection.close();
        interaction.editReply(`Updated Ticket Settings`);
      }
    });
  },
};
