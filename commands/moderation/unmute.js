const {
  SlashCommandBuilder,
  EmbedBuilder,
  ms,
  mongo,
  setup,
  caseSchema,
  PermissionFlagsBits,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("unmutes Member")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Target To Unmute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason for the unmute")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const member = await interaction.guild.members.fetch(target.id);

    await member.timeout(null, reason).then(() => {
      interaction
        .editReply({
          content: `Unmuted ${target.user.tag} successfully!`,
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), ms("5 seconds"));
        });
    });

    await mongo().then(async (mongoose) => {
      try {
        await caseSchema.findOneAndUpdate(
          {
            guildId: interaction.guild.id,
            userId: target.id,
            current: true,
          },
          {
            current: false,
          },
          {
            upsert: true,
          }
        );
      } finally {
        mongoose.connection.close();
      }
    });

    await mongo().then(async (mongoose) => {
      try {
        let caseNumber = await caseSchema.find({
          guildId: interaction.guild.id,
        });
        let count = caseNumber.length + 1;
        await new caseSchema({
          action: "Unmute",
          user: target.user.tag,
          userId: target.id,
          guildId: interaction.guild.id,
          reason,
          staffTag: interaction.user.tag,
          case: count,
          auto: false,
          resolved: false,
        }).save();

        const result = await setup.findOne({
          _id: interaction.guild.id,
        });
        if (result) {
          let channelId = result.moderationId;
          let channel = interaction.guild.channels.cache.get(channelId);

          const exampleEmbed1 = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`Unmute - Case #${count}`)
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

          await channel.send({
            embeds: [exampleEmbed1],
          });
        }
      } finally {
        mongoose.connection.close();
      }
    });
  },
};
