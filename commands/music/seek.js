const {
  SlashCommandBuilder,
  client,
  EmbedBuilder,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("seeks to a specific time")
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Minutes you want to skip to")
        .setMinValue(0)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("seconds")
        .setDescription("Seconds you want to skip to")
        .setMinValue(0)
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const minutes = interaction.options.getInteger("minutes");
      const seconds = interaction.options.getInteger("seconds");
      const time = minutes * 60 + seconds;
      let queue = await client.distube.getQueue(interaction);
      if (!queue)
        return interaction.editReply(
          `There Is Nothing In The Queue Right Now!`
        );
      console.log("Song" + queue.songs[0].duration);
      console.log("Time " + time);
      if (queue.songs[0].duration < time)
        return interaction.editReply(
          `Time can not be longer than the duration of the song!`
        );
      queue = await queue.seek(time);

      let exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`Seeked Song To ${queue.formattedCurrentTime}`)
        .addFields({
          name: "Now Playing",
          value: `[${queue.songs[0].name}](${queue.songs[0].url}) - ${queue.formattedCurrentTime} / ${queue.songs[0].formattedDuration}`,
        });
      interaction.editReply({ embeds: [exampleEmbed] });
    } catch (error) {}
  },
};
