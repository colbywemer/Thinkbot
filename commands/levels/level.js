const {
  SlashCommandBuilder,
  canvacord,
  Levels,
  card,
  mongo,
  AttachmentBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("returns users level")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("user that you want level info on")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("target") || interaction.user;
    const userId = user.id;

    let status;
    try {
      status = interaction.guild.members.cache.get(user.id).presence.status;
    } catch (error) {
      status = "offline";
    }

    await mongo().then(async (mongoose) => {
      try {
        let backgroundType = "IMAGE";
        let background =
          "https://www.ambientum.com/wp-content/uploads/2019/10/via-lactea-estrellas-696x385.jpg";
        let cardPref = await card.findOne({
          guildId: interaction.guildId,
          userId,
        });
        let textColor =
          cardPref && cardPref.textColor ? cardPref.textColor : "RED";
        let progressbarColor =
          cardPref && cardPref.progressbarColor
            ? cardPref.progressbarColor
            : "RED";
        if (cardPref && cardPref.backgroundImage) {
          background = cardPref.backgroundImage;
        } else if (cardPref && cardPref.backgroundColor) {
          backgroundType = "COLOR";
          background = cardPref.backgroundColor;
        }

        const target = await Levels.fetch(userId, interaction.guild.id, true);
        if (!target)
          return interaction.editReply(
            `${user.tag} does not have any levels within the server.`
          );
        const neededXp = Levels.xpFor(parseInt(target.level) + 1);
        const rankcard = new canvacord.Rank() // Build the Rank Card
          .setAvatar(user.displayAvatarURL({ format: "png", size: 512 }))
          .setCurrentXP(target.xp, textColor) // Current User Xp
          .setRequiredXP(neededXp, textColor) // We calculate the required Xp for the next level
          .setRank(target.position, textColor) // Position of the user on the leaderboard
          .setLevel(target.level, textColor) // Current Level of the user
          .setStatus(status)
          .setProgressBar(progressbarColor)
          .setUsername(user.username, textColor)
          .setDiscriminator(user.discriminator, textColor)
          .setBackground(backgroundType, background);
        rankcard.build().then((data) => {
          let attachment = new AttachmentBuilder(data, "RankCard.png");
          interaction.editReply({
            files: [attachment],
          });
        });
      } finally {
        mongoose.connection.close();
      }
    });
  },
};
