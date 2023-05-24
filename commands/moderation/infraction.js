const {
  SlashCommandBuilder,
  EmbedBuilder,
  mongo,
  infractionSchema,
} = require("../../dependencies");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("infraction")
    .setDescription("automod action")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-mute")
        .setDescription("automod mute action")
        .addIntegerOption((option) =>
          option
            .setName("infraction-number")
            .setDescription(
              "infraction number you want to start mute action at"
            )
            .setRequired(true)
            .setMinValue(1)
        )
        .addIntegerOption((option) =>
          option
            .setName("days")
            .setDescription("Days you want to mute user for")
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(27)
        )
        .addIntegerOption((option) =>
          option
            .setName("hours")
            .setDescription("Hours you want to mute user for")
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(23)
        )
        .addIntegerOption((option) =>
          option
            .setName("minutes")
            .setDescription("Minutes you want to mute user for")
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(59)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-ban")
        .setDescription("automod ban action")
        .addIntegerOption((option) =>
          option
            .setName("infraction-number")
            .setDescription("infraction number you want to start ban action at")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("days")
            .setDescription("Days you want to ban user for")
            .setRequired(false)
            .setMinValue(1)
        )
        .addIntegerOption((option) =>
          option
            .setName("hours")
            .setDescription("Hours you want to ban user for")
            .setRequired(false)
            .setMinValue(1)
        )
        .addIntegerOption((option) =>
          option
            .setName("minutes")
            .setDescription("Minutes you want to ban user for")
            .setRequired(false)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-warn")
        .setDescription("automod warn action")
        .addIntegerOption((option) =>
          option
            .setName("infraction-number")
            .setDescription(
              "infraction number you want to start warn action at"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("resets an infraction action")
        .addIntegerOption((option) =>
          option
            .setName("infraction-number")
            .setDescription("infraction number you want to remove action for")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("shows list of created infraction actions")
    ),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand("infraction");
    const infractionNumber =
      interaction.options.getInteger("infraction-number");
    if (subCommand === "list") {
      await mongo().then(async (mongoose) => {
        let response = "";
        let infraction = await infractionSchema.find({
          guildId: interaction.guild.id,
        });
        for (let index = 0; index < infraction.length; index++) {
          if (infraction[index].time) {
            response +=
              "Infraction #: " +
              infraction[index].infraction +
              ", Action: " +
              infraction[index].action +
              ", Duration: " +
              infraction[index].time +
              "\n";
          } else {
            response +=
              "Infraction #: " +
              infraction[index].infraction +
              ", Action: " +
              infraction[index].action +
              "\n";
          }
        }
        const exampleEmbed1 = new EmbedBuilder().setColor("#FF0000").addFields({
          name: "Infraction Action",
          value: response ? response : "\u200B",
        });
        await interaction.editReply({ embeds: [exampleEmbed1] });
      });
    } else if (subCommand === "remove") {
      await mongo().then(async (mongoose) => {
        await infractionSchema.findOneAndDelete({
          guildId: interaction.guild.id,
          infraction: infractionNumber,
        });
      });
      interaction.editReply("Removed infraction action");
    } else {
      const days = interaction.options.getInteger("days");
      const hours = interaction.options.getInteger("hours");
      const minutes = interaction.options.getInteger("minutes");
      let time = "";
      let action = "Warn";
      if (subCommand === "add-ban") action = "Ban";
      else if (subCommand === "add-mute") action = "Mute";
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
        if (subCommand === "add-mute") {
          return interaction.editReply("You Must specify a amount of time!");
        }
        time = "Forever";
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

      await mongo().then(async (mongoose) => {
        if (duration == 0) {
          await infractionSchema.findOneAndReplace(
            { guildId: interaction.guild.id, infraction: infractionNumber },
            {
              action,
              guildId: interaction.guild.id,
              time,
              infraction: infractionNumber,
            },
            {
              upsert: true,
            }
          );
        } else {
          await infractionSchema.findOneAndReplace(
            { guildId: interaction.guild.id, infraction: infractionNumber },
            {
              action,
              guildId: interaction.guild.id,
              time,
              duration,
              infraction: infractionNumber,
            },
            {
              upsert: true,
            }
          );
        }
      });
      interaction.editReply("Added infraction action");
    }
  },
};
