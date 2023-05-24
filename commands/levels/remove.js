const { SlashCommandBuilder, Levels } = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("remove command for leveling system")
    .addUserOption((option) =>
      option.setName("user").setDescription("user").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("choose whether you want to set xp or level")
        .setRequired(true)
        .addChoices(
          { name: "Xp", value: "xp" },
          { name: "Level", value: "level" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("amount you want to add to it")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const type = interaction.options.getString("type");
    const value = interaction.options.getInteger("amount");
    const levelUser = await Levels.fetch(user.id, interaction.guild.id);
    if (!levelUser)
      return interaction.editReply(`${user.tag} is not in the database!`);
    if (value < 1)
      return interaction.editReply(
        "You need to insert a value greater than 0!"
      );
    if (type == "xp") {
      if (levelUser.xp < value)
        return interaction.editReply(
          "You can not remove more xp than the user has!"
        );
      await Levels.subtractXp(user.id, interaction.guild.id, value);
      interaction.editReply(`Subtracted ${value} xp from ${user.tag}`);
    }
    if (type == "level") {
      if (levelUser.level < value)
        return interaction.editReply(
          "You can not remove more levels than the user has!"
        );
      await Levels.subtractLevel(user.id, interaction.guild.id, value);
      interaction.editReply(`Subtracted ${value} level(s) from ${user.tag}`);
    }
  },
};
