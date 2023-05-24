const {
  SlashCommandBuilder,
  ms,
  mongo,
  customCommandSchema,
  PermissionFlagsBits,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("custom")
    .setDescription("custom command configurations")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("create a custom command")
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("name of custom command")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("description for this custom command")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("response")
            .setDescription(
              "response for this custom command - use (/n) for newline"
            )
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("owner-only")
            .setDescription("response for this custom command")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("permitted-roles")
            .setDescription("Example: @role1, @role2...")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("deletes a custom command")
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("name of custom command")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    const commandName = interaction.options.getString("command").toLowerCase();
    await mongo().then(async (mongoose) => {
      const customCommand = await customCommandSchema.findOne({
        commandName,
        guildId: interaction.guildId,
      });
      if (subCommand === "create") {
        let response = interaction.options.getString("response");
        const description = interaction.options.getString("description");
        let ownerOnly = interaction.options.getBoolean("owner-only");
        const permittedRoles = interaction.options.getString("permitted-roles");
        let rolesSplit = [];
        const properties = {
          commandName,
          description,
          guildId: interaction.guildId,
          ownerOnly,
        };
        if (permittedRoles) {
          rolesSplit = permittedRoles.split(",");
        }
        let responseSplit = response.split("(/n)");

        if (!customCommand) {
          await customCommandSchema.create(properties);
          if (rolesSplit.length > 0) {
            for (let index = 0; index < rolesSplit.length; index++) {
              let element = rolesSplit[index];
              element = element.replace(/[^a-zA-Z0-9]/g, "");
              await customCommandSchema.findOneAndUpdate(properties, {
                $addToSet: {
                  permittedRoles: element,
                },
              });
            }
          }
          for (let index = 0; index < responseSplit.length; index++) {
            const element = responseSplit[index];
            await customCommandSchema.findOneAndUpdate(properties, {
              $addToSet: {
                response: element,
              },
            });
          }
        } else {
          await customCommandSchema.findOneAndReplace(
            {
              commandName,
              guildId: interaction.guildId,
            },
            properties
          );
          if (rolesSplit.length > 0) {
            for (let index = 0; index < rolesSplit.length; index++) {
              let element = rolesSplit[index];
              element = element.replace(/[^a-zA-Z0-9]/g, "");
              await customCommandSchema.findOneAndUpdate(properties, {
                $addToSet: {
                  permittedRoles: element,
                },
              });
            }
          }
          for (let index = 0; index < responseSplit.length; index++) {
            const element = responseSplit[index];
            await customCommandSchema.findOneAndUpdate(properties, {
              $addToSet: {
                response: element,
              },
            });
          }
        }
        await interaction.guild.commands.create({
          name: commandName,
          description: description,
        });
        return interaction.editReply("Custom command created").then((msg) => {
          setTimeout(() => msg.delete(), ms("5 seconds"));
        });
      } else if (subCommand === "delete") {
        if (!customCommand)
          return interaction
            .editReply("That custom command does not exist")
            .then((msg) => {
              setTimeout(() => msg.delete(), ms("5 seconds"));
            });
        await customCommand.delete();
        const command = await interaction.guild.commands.cache.find(
          (cmd) => cmd.name === commandName
        );

        await interaction.guild.commands.delete(command.id);

        return interaction
          .editReply("Custom command has been deleted")
          .then((msg) => {
            setTimeout(() => msg.delete(), ms("5 seconds"));
          });
      }
    });
  },
};
