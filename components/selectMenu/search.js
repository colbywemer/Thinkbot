const { client, EmbedBuilder, mongo, setup } = require("../../dependencies");

module.exports = {
  data: {
    name: "search",
  },
  async execute(interaction) {
    if (interaction.message.interaction.user.id != interaction.user.id)
      return interaction.deferUpdate();
    const url = interaction.values[0];
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      const exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Please join a voice channel first!");

      return interaction.reply({ embeds: [exampleEmbed] });
    }
    await mongo().then(async (mongoose) => {
      let settings = await setup.findOne({
        _id: interaction.guildId,
      });
      if (
        settings.musicId.length > 0 &&
        interaction.member.id != interaction.guild.ownerId
      ) {
        let musicChannel = false;
        for (let index = 0; index < settings.musicId.length; index++) {
          const element = settings.musicId[index];
          if (element == interaction.member.voice.channel.id)
            musicChannel = true;
        }
        if (!musicChannel) {
          const exampleEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("I am not allowed to play music in this voice channel!");

          return interaction.reply({ embeds: [exampleEmbed] });
        }
      }
      int;
      await client.distube.play(voiceChannel, url, {
        textChannel: interaction.channel,
        member: interaction.member,
      });
      const queue = client.distube.getQueue(interaction);
      let embedTitle;
      if (queue.songs.length == 1) {
        embedTitle = "Now Playing";
        queue.setVolume(100);
      } else {
        embedTitle = "Song Added To Queue";
      }
      interaction.deferUpdate();
      const exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(embedTitle)
        .setDescription(
          `${queue.songs[queue.songs.length - 1].name} \n${
            queue.songs[queue.songs.length - 1].url
          }`
        )
        .setThumbnail(queue.songs[queue.songs.length - 1].thumbnail)
        .setFooter({ text: `Added by ${interaction.user.tag}` });

      interaction.message.edit({ embeds: [exampleEmbed], components: [] });
    });
  },
};
