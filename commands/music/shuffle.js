const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("shuffles the queue"),

  async execute(interaction) {
    try {
      let queue = await client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply(
          `There Is Nothing In The Queue Right Now!`
        );
      await queue.shuffle();

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
      if (next != "") {
        exampleEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Shuffled The Queue")
          .addFields(
            {
              name: "Now Playing",
              value: `[${queue.songs[0].name}](${queue.songs[0].url}) - ${queue.formattedCurrentTime} / ${queue.songs[0].formattedDuration}`,
            },
            {
              name: "Up Next",
              value: next,
            }
          );
      } else {
        exampleEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("No Songs In Up Next To Shuffle");
      }

      interaction.editReply({ embeds: [exampleEmbed] });
    } catch (error) {}
  },
};
