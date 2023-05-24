const {
  SlashCommandBuilder,
  Levels,
  mongo,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("returns leaderboard"),

  async execute(interaction) {
    await mongo().then(async (mongoose) => {
      try {
        const rawLeaderboard = await Levels.fetchLeaderboard(
          interaction.guild.id,
          10
        );
        if (rawLeaderboard.legnth < 1) {
          exampleEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Leaderboard")
            .setDescription(`Leaderboard Is Empty!`);

          return interaction.editReply({ embeds: [exampleEmbed] });
        }
        const leaderboard = await Levels.computeLeaderboard(
          client,
          rawLeaderboard,
          true
        );
        const lb = leaderboard.map(
          (e) =>
            `${e.position}. ${e.username}#${e.discriminator}\nLevel: ${
              e.level
            }\nXp: ${e.xp.toLocaleString()}`
        );

        exampleEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Leaderboard")
          .setDescription(`${lb.join("\n\n")}`);

        interaction.editReply({ embeds: [exampleEmbed] });
      } finally {
        mongoose.connection.close();
      }
    });
  },
};
