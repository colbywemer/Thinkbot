const {
  SlashCommandBuilder,
  mongo,
  client,
  EmbedBuilder,
  ytpl,
  setup,
  SoundCloudPlugin,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play a song")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("youtube")
        .setDescription("plays song from YouTube")
        .addStringOption((option) =>
          option
            .setName("songtitle")
            .setDescription("title of the song")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("soundcloud")
        .setDescription("plays song from SoundCloud")
        .addStringOption((option) =>
          option
            .setName("songtitle")
            .setDescription("title of the song")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    try {
      let song = interaction.options.getString("songtitle");
      const voiceChannel = interaction.member.voice.channel;
      const subcommand = interaction.options.getSubcommand();
      if (!voiceChannel) {
        const exampleEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Please join a voice channel first!");

        return interaction.editReply({ embeds: [exampleEmbed] });
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
              .setTitle(
                "I am not allowed to play music in this voice channel!"
              );

            return interaction.editReply({ embeds: [exampleEmbed] });
          }
        }
        if (subcommand == "soundcloud" && !song.includes("youtube.com")) {
          let result = await SoundCloudPlugin.search(song, "track", 1);
          song = result[0].url;
        }
        await client.distube.play(voiceChannel, song, {
          textChannel: interaction.channel,
          member: interaction.member,
        });
        const queue = client.distube.getQueue(interaction);
        let thumbnail;
        let name;
        let embedTitle;
        let musicUrl;

        function isValidUrl(string) {
          try {
            new URL(string);
          } catch (_) {
            return false;
          }
          return true;
        }

        if (
          isValidUrl(song) &&
          song.includes("list=") &&
          song.includes("youtube.com")
        ) {
          const playlist = await ytpl(song);
          name = playlist.title;
          thumbnail = playlist.bestThumbnail.url;
          embedTitle = "Playlist Added To Queue";
          musicUrl = song;
        } else {
          if (queue.songs.length == 1) {
            embedTitle = "Now Playing";
            queue.setVolume(100);
          } else {
            embedTitle = "Song Added To Queue";
          }
          name = queue.songs[queue.songs.length - 1].name;
          thumbnail = queue.songs[queue.songs.length - 1].thumbnail;
          musicUrl = queue.songs[queue.songs.length - 1].url;
        }

        const exampleEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle(embedTitle)
          .setDescription(`${name} \n${musicUrl}`)
          .setThumbnail(thumbnail)
          .setFooter({ text: `Added by ${interaction.user.tag}` });

        interaction.editReply({ embeds: [exampleEmbed] });
      });
    } catch (error) {
      console.error(error);
      exampleEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("An error occurred!");

      return interaction.editReply({ embeds: [exampleEmbed] });
    }
  },
};
