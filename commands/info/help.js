const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("help command for bot"),

  async execute(interaction) {
    let menu = new StringSelectMenuBuilder()
      .setCustomId("help")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("General")
          .setValue("general")
          .setDescription("Display Help Menu For General Commands"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Music")
          .setValue("music")
          .setDescription("Display Help Menu For Music Commands"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Games")
          .setValue("games")
          .setDescription("Display Help Menu For Game Commands"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Leveling")
          .setValue("leveling")
          .setDescription("Display Help Menu For Level Commands")
      );

    if (
      interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      menu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Moderation")
          .setValue("moderation")
          .setDescription("Display Help Menu For Moderation Commands"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Administrator")
          .setValue("administrator")
          .setDescription("Display Help Menu For Administrator Commands")
      );
    } else if (
      interaction.member.permissions.has(
        PermissionsBitField.Flags.BanMembers ||
          PermissionsBitField.Flags.KickMembers ||
          PermissionsBitField.Flags.ModerateMembers ||
          PermissionsBitField.Flags.ManageMessages
      )
    ) {
      menu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Moderation")
          .setValue("moderation")
          .setDescription("Display Help Menu For Moderation Commands")
      );
    }

    await interaction.editReply({
      components: [new ActionRowBuilder().addComponents(menu)],
    });
  },
};
