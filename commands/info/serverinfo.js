const {
  EmbedBuilder,
  SlashCommandBuilder,
  moment,
  client,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("displays the servers info"),

  async execute(interaction) {
    const userroles = interaction.guild.roles.cache.map((r) => r.name);
    const Owner = client.users.cache.get(interaction.guild.ownerId).tag;
    const online = interaction.guild.members.cache.filter(
      (member) => member.presence?.status === "online"
    );
    const offline = interaction.guild.members.cache.filter(
      (member) => member.presence?.status != "online"
    );
    const dnd = interaction.guild.members.cache.filter(
      (member) => member.presence?.status === "dnd"
    );
    const idle = interaction.guild.members.cache.filter(
      (member) => member.presence?.status === "idle"
    );
    let tier = interaction.guild.premiumTier;
    if (tier === "NONE") {
      tier = 0;
    }
    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FF0000")
          .setAuthor({
            name: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
          })
          .addFields(
            {
              name: "Overview",
              value: `Server Region: ${
                interaction.guild.preferredLocale
              } \nOwner: ${Owner} \nBoosts: ${
                interaction.guild.premiumSubscriptionCount
              } (Tier ${tier}) \nCreated: ${moment(
                interaction.guild.createdTimestamp
              ).format("MMMM Do YYYY")} at ${moment(
                interaction.guild.createdTimestamp
              ).format("h:mm A")}\nOnline: ${
                online.size + idle.size + dnd.size
              } \nOffline: ${offline.size - idle.size - dnd.size}`,
              inline: true,
            },
            {
              name: `\u200B`,
              value: `Channels: ${
                interaction.guild.channels.cache.filter((c) => c.type !== 4)
                  .size
              } \nText Channels: ${
                interaction.guild.channels.cache.filter((c) => c.type === 0)
                  .size +
                interaction.guild.channels.cache.filter((c) => c.type === 5)
                  .size
              } \nVoice Channels: ${
                interaction.guild.channels.cache.filter((c) => c.type === 2)
                  .size
              } \nTotal Users: ${interaction.guild.memberCount} \nMembers: ${
                interaction.guild.members.cache.filter((m) => !m.user.bot).size
              } \nBots: ${
                interaction.guild.members.cache.filter((m) => m.user.bot).size
              }`,
              inline: true,
            },
            {
              name: `Roles (${userroles.length - 1})`,
              value:
                `${interaction.guild.roles.cache
                  .map((role) => role.toString())
                  .join(` `)
                  .slice(9)}` || `None`,
            }
          )
          .setTimestamp()
          .setFooter({
            text: `ID: ${interaction.guild.id}`,
          }),
      ],
    });
  },
};
