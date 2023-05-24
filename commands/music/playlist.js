const {
  SlashCommandBuilder,
  mongo,
  setup,
  playlistSchema,
  client,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("playlist")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("adds songs to playlist")
        .addStringOption((option) =>
          option
            .setName("playlist")
            .setDescription("Playlist name")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("songs")
            .setDescription("Example: song1, song2, ...")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("playlist you want to play")
        .addStringOption((option) =>
          option
            .setName("playlist")
            .setDescription("Playlist name")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("removes songs from playlist")
        .addStringOption((option) =>
          option
            .setName("playlist")
            .setDescription("Playlist name")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("songs")
            .setDescription("Example: song1, song2, ...")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("destroy")
        .setDescription("removes the entire playlist")
        .addStringOption((option) =>
          option
            .setName("playlist")
            .setDescription("Playlist name")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand("playlist");
    const songs = interaction.options.getString("songs");
    const playlist = interaction.options.getString("playlist");

    await mongo().then(async (mongoose) => {
      const perms = await setup.findOne({ _id: interaction.guildId });
      let dj = false;
      let hasperms = false;
      if (perms.musicManagement.length > 0) {
        for (let index = 0; index < perms.musicManagement.length; index++) {
          const managmentRole = perms.musicManagement[index];
          let hasRole = interaction.guild.roles.cache
            .get(managmentRole)
            .members.map((m) => m.user.id);
          for (let index = 0; index < hasRole.length; index++) {
            const user = hasRole[index];
            if (user == interaction.user.id) hasperms = true;
          }
        }
      }
      if (perms.dj.length > 0) {
        for (let index = 0; index < perms.dj.length; index++) {
          const djRole = perms.dj[index];
          let hasRole = interaction.guild.roles.cache
            .get(djRole)
            .members.map((m) => m.user.id);
          for (let index = 0; index < hasRole.length; index++) {
            const user = hasRole[index];
            if (user == interaction.user.id) dj = true;
          }
        }
      }
      const exists = await playlistSchema.findOne({
        guildId: interaction.guildId,
        name: playlist,
      });
      if (subCommand === "add") {
        if (
          perms.musicManagement.length > 0 &&
          interaction.user.id != interaction.guild.ownerId &&
          !hasperms
        )
          return interaction.editReply(
            "You don't have permission to use this command"
          );
        if (
          perms.musicManagement.length == 0 &&
          interaction.user.id != interaction.guild.ownerId
        )
          return interaction.editReply(
            "You don't have permission to use this command"
          );
        let songSplit = songs.split(",");
        if (!exists) {
          await playlistSchema.create({
            guildId: interaction.guildId,
            name: playlist,
          });
        }

        for (let index = 0; index < songSplit.length; index++) {
          const element = songSplit[index];
          let song = element.trim();

          await playlistSchema.findOneAndUpdate(
            { guildId: interaction.guildId, name: playlist },
            {
              $addToSet: {
                songs: song,
              },
            }
          );
        }
        if (songSplit > 1) interaction.editReply("Songs added to playlist");
        else interaction.editReply("Song added to playlist");
      } else if (subCommand === "play") {
        if (!exists) return interaction.editReply("Playlist doesn't exist");
        if (perms.dj.length > 0) {
          if (!dj && interaction.user.id != interaction.guild.ownerId)
            return interaction.editReply(
              "You do not have permission to use this command"
            );
        }
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel)
          return interaction.editReply({
            content: "Please join a voice channel first!",
          });
        let musicChannel = false;
        for (let index = 0; index < perms.musicId.length; index++) {
          const channel = perms.musicId[index];
          if (channel == interaction.member.voice.channel.id)
            musicChannel = true;
        }
        if (!musicChannel && interaction.user.id != interaction.guild.ownerId)
          return interaction.editReply(
            "I am not allowed to play music in this voice channel"
          );

        const sleep = (milliseconds) => {
          return new Promise((resolve) => setTimeout(resolve, milliseconds));
        };
        try {
          for (let index = 0; index < exists.songs.length; index++) {
            const song = exists.songs[index];
            console.log(song);
            await client.distube.play(voiceChannel, song, {
              textChannel: interaction.channel,
              member: interaction.member,
            });
          }
          interaction.editReply(`Playing ${playlist} playlist`);
        } catch (error) {
          interaction.editReply(
            "An error occurred while trying to play the playlist"
          );
        }
      } else if (subCommand === "remove") {
        if (
          perms.musicManagement.length > 0 &&
          interaction.user.id != interaction.guild.ownerId &&
          !hasperms
        )
          return interaction.editReply(
            "You don't have permission to use this command"
          );
        if (
          perms.musicManagement.length == 0 &&
          interaction.user.id != interaction.guild.ownerId
        )
          return interaction.editReply(
            "You don't have permission to use this command"
          );
        if (!exists) return interaction.editReply("Playlist doesn't exist");
        let songSplit = songs.split(",");
        for (let index = 0; index < songSplit.length; index++) {
          const element = songSplit[index];
          let song = element.trim();

          await playlistSchema.findOneAndUpdate(
            { guildId: interaction.guildId, name: playlist },
            {
              $pull: {
                songs: song,
              },
            }
          );
        }
        if (songSplit > 1) interaction.editReply("Removed songs from playlist");
        else interaction.editReply("Removed song from playlist");
      } else {
        if (
          perms.musicManagement.length > 0 &&
          interaction.user.id != interaction.guild.ownerId &&
          !hasperms
        )
          return interaction.editReply(
            "You don't have permission to use this command"
          );
        if (
          perms.musicManagement.length == 0 &&
          interaction.user.id != interaction.guild.ownerId
        )
          return interaction.editReply(
            "You don't have permission to use this command"
          );
        if (!exists) return interaction.editReply("Playlist doesn't exist");
        await playlistSchema.findOneAndDelete({
          guildId: interaction.guildId,
          name: playlist,
        });
        interaction.editReply("Playlist deleted");
      }
    });
  },
};
