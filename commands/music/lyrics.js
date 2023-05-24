const {
  EmbedBuilder,
  SlashCommandBuilder,
  client,
  Genius,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("display lyrics for the current song or a specific song")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("specific song for lyrics")
        .setRequired(false)
    ),
  async execute(interaction) {
    const title = interaction.options.getString("title");
    let sendTitle = "";
    if (title) sendTitle = title;
    else {
      const queue = client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply({
          content: "No music is currently being played",
        });
      sendTitle = queue.songs[0].name;
    }
    try {
      const geniusClient = new Genius.Client();

      const searches = await geniusClient.songs.search(sendTitle);
      const firstSong = searches[0];
      const lyrics = await firstSong.lyrics();

      const substring = (length, value) => {
        const words = value.split(" ");
        const lines = [];
        let currentLine = "";

        for (const word of words) {
          if ((currentLine + word).length <= length) {
            currentLine += word + " ";
          } else {
            lines.push(currentLine.trim());
            currentLine = word + " ";
          }
        }

        if (currentLine.trim() !== "") {
          lines.push(currentLine.trim());
        }

        return lines;
      };

      const embeds = substring(4096, lyrics).map((value, index) => {
        const isFirst = index === 0;

        return new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle(
            isFirst ? `${firstSong.title} - ${firstSong.artist.name}` : null
          )
          .setThumbnail(isFirst ? firstSong.thumbnail : null)
          .setDescription(`${value}`);
      });

      return interaction.editReply({ embeds: embeds });
    } catch (error) {
      const exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`No Lyrics Were Found For: ${sendTitle}`);

      return interaction.editReply({ embeds: [exampleEmbed] });
    }
  },
};
