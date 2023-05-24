const { EmbedBuilder } = require("../../dependencies");

module.exports = {
  data: {
    name: "help",
  },
  async execute(interaction) {
    if (interaction.message.interaction.user.id != interaction.user.id)
      return interaction.deferUpdate();
    const category = interaction.values[0];
    let embed;
    switch (category) {
      case "general":
        embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("General Commands")
          .addFields(
            {
              name: "echo",
              value:
                "Echos your message (if a user is provided it sends them a direct message)",
            },
            {
              name: "userinfo",
              value:
                "Returns your user info (if user is provided, it sends provided users info)",
            },
            {
              name: "serverinfo",
              value: `Returns the server info`,
            }
          )
          .setTimestamp();
        break;
      case "music":
        embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Music Commands")
          .addFields(
            {
              name: "play",
              value:
                "Echos your message (if a user is provided it sends them a direct message)",
            },
            {
              name: "userinfo",
              value:
                "Returns your user info (if user is provided, it sends provided users info)",
            },
            {
              name: "serverinfo",
              value: `Returns the server info`,
            }
          )
          .setTimestamp();
        break;
      case "games":
        embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Game Commands")
          .addFields({
            name: "blackjack",
            value:
              "Echos your message (if a user is provided it sends them a direct message)",
          })
          .setTimestamp();
        break;
      case "leveling":
        embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Leveling Commands")
          .addFields(
            {
              name: "add",
              value: "adds specified amount of levels/xp to the user provided",
            },
            {
              name: "remove",
              value:
                "removes specified amount of levels/xp from the user provided",
            },
            {
              name: "set",
              value: "sets the level/xp of the user provided",
            },
            {
              name: "level",
              value: `returns the level info of the user provided (if none provided, user that sent the command)`,
            },
            {
              name: "leaderboard",
              value: `returns the top 10 users in the server`,
            }
          )
          .setTimestamp();
        break;
      case "moderation":
        embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Moderation Commands")
          .addFields(
            {
              name: "ban",
              value: "Bans specified user from server",
            },
            {
              name: "kick",
              value: "Kicks specified user from server",
            },
            {
              name: "mute",
              value: "Mutes specified user",
            },
            {
              name: "unban",
              value: `Unbans specified user from the server(Must use userid)`,
            },
            {
              name: "unmute",
              value: `Unmutes specified user`,
            },
            {
              name: "clear",
              value: `clears specified amount of messages`,
            }
          )
          .setTimestamp();
        break;
      case "administrator":
        embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Administrator Commands")
          .addFields(
            {
              name: "setup",
              value: `Sets up moderation logs channel and member logs channel`,
            },
            {
              name: "custom create",
              value: `Creates a custom command with the name, description, and response provided`,
            },
            {
              name: "custom delete",
              value: `Deletes a custom command with the name provided`,
            }
          )
          .setTimestamp();
        break;
    }
    await interaction.message.edit({
      embeds: [embed],
    });
    interaction.deferUpdate();
  },
};
