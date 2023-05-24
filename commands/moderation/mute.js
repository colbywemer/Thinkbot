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
    .setName("mute")
    .setDescription("Mutes Member")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Target To Mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason for the mute")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("days")
        .setDescription("Days you want to mute user for")
        .setRequired(false)
        .setMaxValue(27)
        .setMinValue(1)
    )
    .addIntegerOption((option) =>
      option
        .setName("hours")
        .setDescription("Hours you want to mute user for")
        .setRequired(false)
        .setMaxValue(23)
        .setMinValue(1)
    )
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Minutes you want to mute user for")
        .setRequired(false)
        .setMaxValue(59)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const days = interaction.options.getInteger("days");
    const hours = interaction.options.getInteger("hours");
    const minutes = interaction.options.getInteger("minutes");
    let time = "";
    if (days || hours || minutes) {
      if (days) {
        if (days > 1) {
          time = days + " days ";
        } else {
          time = days + " day ";
        }
      }
      if (hours) {
        if (hours > 1) {
          time += hours + " hours ";
        } else {
          time += hours + " hour ";
        }
      }
      if (minutes) {
        if (hours || days) {
          if (minutes > 1) {
            time += "and " + minutes + " minutes";
          } else {
            time += "and " + minutes + " minute";
          }
        } else {
          if (minutes > 1) {
            time += minutes + " minutes";
          } else {
            time += minutes + " minute";
          }
        }
      }
    } else {
      return interaction
        .editReply({
          content: "You must specify a time!",
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), ms("5 seconds"));
        });
    }
    if (target === null)
      return interaction.editReply("Please enter a valid user to be muted");
    if (interaction.member.id != interaction.guild.ownerId) {
      if (
        interaction.member.roles.highest.position <=
        target.roles.highest.position
      )
        return interaction
          .editReply({
            content:
              "You are not able to mute someone with a higher role than you!",
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), ms("5 seconds"));
          });
    }
    if (target.id === interaction.guild.ownerId) {
      return interaction
        .editReply("You can not mute the server owner!")
        .then((msg) => {
          setTimeout(() => msg.delete(), ms("5 seconds"));
        });
    }

    let duration = 0;
    if (days) {
      duration = duration + days * 24 * 60;
    }
    if (hours) {
      duration = duration + hours * 60;
    }
    if (minutes) {
      duration = duration + minutes;
    }
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + duration);

    const member = await interaction.guild.members.fetch(target.id);

    await member.timeout(duration * 60 * 1000, reason).then(() => {
      interaction
        .editReply({
          content: `Muted ${target.user.tag} successfully!`,
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), ms("5 seconds"));
        })
        .then(() => {
          const exampleEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`You have been muted in ${interaction.guild.name}`)
            .addFields(
              {
                name: "Reason",
                value: `${reason}`,
              },
              {
                name: `Moderator`,
                value: interaction.user.tag,
              },
              {
                name: "Duration",
                value: time.trim(),
              }
            );
          if (!target.user.bot) {
            target.send({
              embeds: [exampleEmbed],
            });
          }
        });
    });

    await mongo().then(async (mongoose) => {
      let caseNumber = await caseSchema.find({
        guildId: interaction.guild.id,
      });
      let count = caseNumber.length + 1;

      await new caseSchema({
        action: "Mute",
        user: target.user.tag,
        userId: target.id,
        guildId: interaction.guild.id,
        reason,
        expires,
        current: true,
        staffTag: interaction.user.tag,
        duration: time,
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
          .setTitle(`Mute - Case #${count}`)
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
            },
            {
              name: "Duration",
              value: time.trim(),
            }
          );

        await channel.send({
          embeds: [exampleEmbed1],
        });
      }
      mongoose.connection.close();
    });
  },
};
