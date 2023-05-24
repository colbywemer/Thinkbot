const { SlashCommandBuilder, EmbedBuilder } = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-info")
    .setDescription("shows role info")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("role that you want info on")
        .setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const mentionable = role.mentionable ? "Yes" : "No";
    const separately = role.hoist ? "Yes" : "No";
    const color =
      role.color < 0
        ? "#" + (0xffffffff + role.color + 1).toString(16)
        : "#" + role.color.toString(16);

    const exampleEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .addFields(
        { name: `Role Name`, value: role.toString() },
        { name: `Role ID`, value: role.id.toString() },
        { name: `Mentionable`, value: mentionable },
        { name: "Displayed Separately", value: separately },
        { name: "Color", value: color },
        { name: "Position", value: role.rawPosition.toString() },
        { name: `Users in role`, value: role.members.size.toString() }
      )
      .setFooter({ text: `Role Creation Date` })
      .setTimestamp(role.createdAt);
    interaction.editReply({ embeds: [exampleEmbed] });
  },
};
