const {
  SlashCommandBuilder,
  EmbedBuilder,
  client,
  bar,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("now-playing")
    .setDescription("Shows Song Info For The Currently Playing Song"),
  async execute(interaction) {
    const queue = client.distube.getQueue(interaction);
    if (!queue) return interaction.editReply(`There Is Nothing Playing!`);
    const current = queue.currentTime;
    const end = queue.songs[0].duration;
    const value = (current * (100 / end)) / 5;

    bar.default.full = "█";
    bar.default.empty = " - ";
    bar.default.start = "";
    bar.default.end = "";
    bar.default.text = "{bar}";

    const exampleEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Now Playing")
      .setDescription(`[${queue.songs[0].name}](${queue.songs[0].url})`)
      .addFields([
        {
          name: "Uploader",
          value: `[${queue.songs[0].uploader.name}](${queue.songs[0].uploader.url})`,
          inline: true,
        },
        {
          name: "Views",
          value: `${queue.songs[0].views}`,
          inline: true,
        },
        {
          name: "Likes",
          value: `${queue.songs[0].likes}`,
          inline: true,
        },
        {
          name: "Shares",
          value: `${queue.songs[0].reposts}`,
          inline: true,
        },
        {
          name: "Requested By",
          value: `${queue.songs[0].user.tag}`,
          inline: true,
        },
        {
          name: "Volume",
          value: `${queue.volume}`,
          inline: true,
        },
        {
          name: "Duration",
          value: `${queue.formattedCurrentTime} / ${
            queue.songs[0].formattedDuration
          }\n[${bar.progress(20, value)}]`,
          inline: false,
        },
      ])
      .setFooter({
        text: `${queue.songs.length} song • Duration: ${queue.formattedDuration}`,
      });
    interaction.editReply({ embeds: [exampleEmbed] });
  },
};
