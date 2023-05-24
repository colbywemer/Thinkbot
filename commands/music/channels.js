const {
  SlashCommandBuilder,
  mongo,
  setup,
  EmbedBuilder,
  ChannelType,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("roles and channels automod ignores")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("lists channels that allow music commands")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-channel")
        .setDescription("adds channel for music")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel To Add To Allowed Channels")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove-channel")
        .setDescription("removes channel for music")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel To Remove From Allowed Channels")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    ),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    await mongo().then(async (mongoose) => {
      //   try {
      if (subCommand === "list") {
        let list = await setup.findOne({ _id: interaction.guildId });
        let channels = "";
        for (let index = 0; index < list.musicId.length; index++) {
          let currentChannel = interaction.guild.channels.cache.get(
            list.musicId[index]
          );
          if (currentChannel) {
            channels += currentChannel.name;
            if (index != list.musicId.length - 1) {
              channels += ", ";
            }
          }
        }
        if (channels == "") channels = "None";

        const exampleEmbed1 = new EmbedBuilder()
          .addFields({ name: "Music Channels", value: channels })
          .setColor("#FF0000");
        await interaction.editReply({ embeds: [exampleEmbed1] });
      }
      if (subCommand === "add-channel") {
        const channel = interaction.options.getChannel("channel");
        await setup.findOneAndUpdate(
          { _id: interaction.guildId },
          {
            _id: interaction.guildId,
            $addToSet: {
              musicId: channel.id,
            },
          },
          { upsert: true }
        );
        interaction.editReply("Channel added to allowed channels");
      }
      if (subCommand === "remove-channel") {
        const channel = interaction.options.getChannel("channel");
        await setup.findOneAndUpdate(
          { _id: interaction.guildId },
          {
            _id: interaction.guildId,
            $pull: {
              musicId: channel.id,
            },
          },
          { upsert: true }
        );
        interaction.editReply("Channel removed from allowed channels");
      }
      //   } finally {
      //   }
    });
  },
};
