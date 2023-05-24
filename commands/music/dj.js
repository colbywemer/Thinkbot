const {
  EmbedBuilder,
  SlashCommandBuilder,
  setup,
  mongo,
} = require("../../dependencies");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dj")
    .setDescription("roles and channels for music to be allowed")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("lists roles that allow music commands")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-role")
        .setDescription("adds role to dj list")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("role to be added to DJ list")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove-role")
        .setDescription("removes role from dj list")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("role to be removed from DJ list")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    await mongo().then(async (mongoose) => {
      try {
        if (subCommand === "list") {
          let list = await setup.findOne({ _id: interaction.guildId });
          let roles = "";
          for (let index = 0; index < list.dj.length; index++) {
            let currentRole = interaction.guild.roles.cache.get(list.dj[index]);
            if (currentRole) {
              roles += currentRole.name;
              if (index != list.dj.length - 1) {
                roles += ", ";
              }
            }
          }
          if (roles == "") roles = "None";

          const exampleEmbed1 = new EmbedBuilder()
            .addFields({ name: "DJ Roles", value: roles })
            .setColor("#FF0000");
          await interaction.editReply({ embeds: [exampleEmbed1] });
        }
        if (subCommand === "add-role") {
          const role = interaction.options.getRole("role");
          await setup.findOneAndUpdate(
            { _id: interaction.guildId },
            {
              _id: interaction.guildId,
              $addToSet: {
                dj: role.id,
              },
            },
            { upsert: true }
          );

          interaction.editReply("Role is now a dj role");
        }
        if (subCommand === "remove-role") {
          const role = interaction.options.getRole("role");
          await setup.findOneAndUpdate(
            { _id: interaction.guildId },
            {
              _id: interaction.guildId,
              $pull: {
                dj: role.id,
              },
            },
            { upsert: true }
          );
          interaction.editReply("Role is no longer a dj role");
        }
      } finally {
      }
    });
  },
};
