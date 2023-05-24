const {
  SlashCommandBuilder,
  EmbedBuilder,
  setup,
  ms,
  mongo,
  caseSchema,
  PermissionFlagsBits,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("warns a member")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Target To Warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason for the warn")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason = interaction.options.getString("reason");
    if (target === null)
      return interaction.editReply("Please enter a valid user to be muted");
    await mongo().then(async (mongoose) => {
      let caseNumber = await caseSchema.find({
        guildId: interaction.guild.id,
      });
      let count = caseNumber.length + 1;

      await new caseSchema({
        action: "Warn",
        user: target.user.tag,
        userId: target.id,
        guildId: interaction.guild.id,
        reason,
        staffTag: interaction.user.tag,
        case: count,
        auto: false,
        resolved: false,
      }).save();

      const exampleEmbed1 = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`Warn - Case #${count}`)
        .addFields(
          {
            name: "User",
            value: `${target.user.tag}`,
          },
          {
            name: "User ID",
            value: `${target.id}`,
          },
          {
            name: "Reason",
            value: `${reason}`,
          },
          {
            name: `Moderator`,
            value: interaction.user.tag,
          }
        );
      interaction
        .editReply({
          content: `Warned ${target.user.tag} successfully!`,
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), ms("5 seconds"));
        });
      const exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`You have been warned in ${interaction.guild.name}`)
        .addFields(
          {
            name: "Reason",
            value: `${reason}`,
          },
          {
            name: `Moderator`,
            value: interaction.user.tag,
          }
        );
      if (!target.user.bot) {
        target.send({
          embeds: [exampleEmbed],
        });
      }

      const result = await setup.findOne({
        _id: interaction.guild.id,
      });
      if (result) {
        let channelId = result.moderationId;
        let channel = interaction.guild.channels.cache.get(channelId);
        await channel.send({
          embeds: [exampleEmbed1],
        });
      }

      mongoose.connection.close();
    });
  },
};
