const {
  SlashCommandBuilder,
  EmbedBuilder,
  caseSchema,
  mongo,
  PermissionFlagsBits,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("case history")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("viewcase")
        .setDescription("views a case by id")
        .addIntegerOption((option) =>
          option
            .setName("caseid")
            .setDescription("case id of case you want to view")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("viewuser")
        .setDescription("views a user's history")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("user you want to view the history of")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("revoke")
        .setDescription("removes a case by id")
        .addIntegerOption((option) =>
          option
            .setName("caseid")
            .setDescription("case id of case you want to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription("resets a user's history")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("user you want to reset history for")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === "viewcase") {
      const caseNumber = interaction.options.getInteger("caseid");
      await mongo().then(async (mongoose) => {
        try {
          let cases = await caseSchema.findOne({
            guildId: interaction.guild.id,
            case: caseNumber,
            resolved: false,
          });
          if (cases) {
            if (
              cases.action === "Warn" ||
              cases.action === "Kick" ||
              cases.action === "Unban" ||
              cases.action === "Unmute"
            ) {
              const exampleEmbed1 = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`${cases.action} - Case #${cases.case}`)
                .addFields(
                  {
                    name: "User",
                    value: `${cases.user}`,
                  },
                  {
                    name: "User ID",
                    value: `${cases.userId}`,
                  },
                  {
                    name: "Reason",
                    value: `${cases.reason}`,
                  },
                  {
                    name: `Moderator`,
                    value: `${cases.staffTag}`,
                  }
                );
              await interaction.editReply({
                embeds: [exampleEmbed1],
              });
            } else {
              const exampleEmbed1 = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`${cases.action} - Case #${cases.case}`)
                .addFields(
                  {
                    name: "User",
                    value: `${cases.user}`,
                  },
                  {
                    name: "User ID",
                    value: `${cases.userId}`,
                  },
                  {
                    name: "Reason",
                    value: `${cases.reason}`,
                  },
                  {
                    name: `Moderator`,
                    value: `${cases.staffTag}`,
                  },
                  {
                    name: "Duration",
                    value: `${cases.duration}`,
                  }
                );
              await interaction.editReply({
                embeds: [exampleEmbed1],
              });
            }
          } else {
            interaction.editReply("There is no case with that id");
          }
        } finally {
          mongoose.connection.close();
        }
      });
    } else if (subCommand === "viewuser") {
      const user = interaction.options.getMember("user");
      if (user === null)
        return interaction.editReply("Please enter a valid user to be muted");
      await mongo().then(async (mongoose) => {
        try {
          let cases = await caseSchema.find({
            guildId: interaction.guild.id,
            userId: user.id,
            resolved: false,
          });
          let test = "";
          let mutes = 0;
          let autoModMutes = 0;
          let bans = 0;
          let autoModBans = 0;
          let kicks = 0;
          let autoModKicks = 0;
          let warns = 0;
          let autoModWarns = 0;
          if (cases) {
            for (let index = 0; index < cases.length; index++) {
              if (cases[index].action === "Mute") {
                test +=
                  "Case #" +
                  cases[index].case +
                  " | " +
                  cases[index].action +
                  "d by " +
                  cases[index].staffTag +
                  " | " +
                  cases[index].reason +
                  "\n";
                if (cases[index].auto == false) mutes++;
                else autoModMutes++;
              }
              if (cases[index].action === "Unmute")
                test +=
                  "Case #" +
                  cases[index].case +
                  " | " +
                  cases[index].action +
                  "d by " +
                  cases[index].staffTag +
                  " | " +
                  cases[index].reason +
                  "\n";
              if (cases[index].action === "Ban") {
                test +=
                  "Case #" +
                  cases[index].case +
                  " | " +
                  cases[index].action +
                  "ned by " +
                  cases[index].staffTag +
                  " | " +
                  cases[index].reason +
                  "\n";
                if (cases[index].auto == false) bans++;
                else autoModBans++;
              }
              if (cases[index].action === "Unban")
                test +=
                  "Case #" +
                  cases[index].case +
                  " | " +
                  cases[index].action +
                  "ned by " +
                  cases[index].staffTag +
                  " | " +
                  cases[index].reason +
                  "\n";
              if (cases[index].action === "Kick") {
                test +=
                  "Case #" +
                  cases[index].case +
                  " | " +
                  cases[index].action +
                  "ed by " +
                  cases[index].staffTag +
                  " | " +
                  cases[index].reason +
                  "\n";
                if (cases[index].auto == false) kicks++;
                else autoModKicks++;
              }
              if (cases[index].action === "Warn") {
                test +=
                  "Case #" +
                  cases[index].case +
                  " | " +
                  cases[index].action +
                  "ed by " +
                  cases[index].staffTag +
                  " | " +
                  cases[index].reason +
                  "\n";
                if (cases[index].auto == false) warns++;
                else autoModWarns++;
              }
            }
            const exampleEmbed1 = new EmbedBuilder()
              .setAuthor({
                name: `${user.user.tag}'s History`,
                iconURL: user.user.displayAvatarURL(),
              })
              .setColor("#FF0000")
              .setFooter({
                text: `Moderator\nWarns: ${warns} Mutes: ${mutes} Kicks: ${kicks} Bans: ${bans}\nAutomod\nWarns: ${autoModWarns} Mutes: ${autoModMutes} Kicks: ${autoModKicks} Bans: ${autoModBans}`,
              });

            if (test) {
              exampleEmbed1.setDescription(test.trim());
            }
            await interaction.editReply({
              embeds: [exampleEmbed1],
            });
          }
        } finally {
          mongoose.connection.close();
        }
      });
    } else if (subCommand === "revoke") {
      const caseNumber = interaction.options.getInteger("caseid");
      await mongo().then(async (mongoose) => {
        try {
          let result = await caseSchema.findOne({
            guildId: interaction.guild.id,
            case: caseNumber,
            resolved: false,
          });
          if (result) interaction.editReply(`Revoked case #${caseNumber}`);
          else interaction.editReply(`There is no case with that id`);

          await caseSchema.findOneAndUpdate(
            {
              guildId: interaction.guild.id,
              case: caseNumber,
            },
            {
              resolved: true,
            },
            {
              upsert: true,
            }
          );
        } finally {
          mongoose.connection.close();
        }
      });
    } else if (subCommand === "reset") {
      const user = interaction.options.getMember("user");
      if (user === null)
        return interaction.editReply("Please enter a valid user to be muted");
      await mongo().then(async (mongoose) => {
        try {
          let count = (
            await caseSchema.find({
              guildId: interaction.guild.id,
              userId: user.id,
              resolved: false,
            })
          ).length;
          await caseSchema.updateMany(
            {
              guildId: interaction.guild.id,
              userId: user.id,
            },
            {
              resolved: true,
            }
          );
          interaction.editReply(`Revoked ${count} cases from ${user.user.tag}`);
        } catch {
          interaction.editReply(`Revoked 0 cases from ${user.user.tag}`);
        } finally {
          mongoose.connection.close();
        }
      });
    }
  },
};
