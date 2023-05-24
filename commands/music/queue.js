const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
  bar,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("displays song queue"),

  async execute(interaction) {
    const queue = client.distube.getQueue(interaction);
    if (!queue) return interaction.editReply(`There Is Nothing Playing!`);
    let next = "";
    for (let index = 1; (index < queue.songs.length) & (index < 6); index++) {
      const song = queue.songs[index];
      next += `${index}. [${song.name}](${song.url}) - ${queue.songs[index].formattedDuration}\n`;
    }
    if (queue.songs.length > 6) {
      const remainingTrackCount = queue.songs.length - 6;
      next += `...${remainingTrackCount} more ${
        remainingTrackCount === 1 ? "track" : "tracks"
      }`;
    }
    let exampleEmbed;
    const current = queue.currentTime;
    const end = queue.songs[0].duration;
    const value = (current * (100 / end)) / 5;

    bar.default.full = "█";
    bar.default.empty = " - ";
    bar.default.start = "";
    bar.default.end = "";
    bar.default.text = "{bar}";

    if (next != "") {
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Song Queue")
        .addFields(
          {
            name: "Now Playing",
            value: `[${queue.songs[0].name}](${queue.songs[0].url})\n${
              queue.formattedCurrentTime
            } / ${queue.songs[0].formattedDuration}\n[${bar.progress(
              20,
              value
            )}]`,
          },
          {
            name: "Up Next",
            value: next,
          }
        )
        .setFooter({
          text: `${queue.songs.length} songs • Duration: ${queue.formattedDuration}`,
        });
    } else {
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Song Queue")
        .addFields({
          name: "Now Playing",
          value: `[${queue.songs[0].name}](${queue.songs[0].url})\n${
            queue.formattedCurrentTime
          } / ${queue.songs[0].formattedDuration}\n[${bar.progress(
            20,
            value
          )}]`,
        })
        .setFooter({
          text: `${queue.songs.length} song • Duration: ${queue.formattedDuration}`,
        });
    }
    interaction.editReply({ embeds: [exampleEmbed] });
  },
};
