const {
  SlashCommandBuilder,
  EmbedBuilder,
  setup,
  mongo,
  client,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  SoundCloudPlugin,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("play a song")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("youtube")
        .setDescription("search youtube for songs")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("query to search")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("soundcloud")
        .setDescription("search soundcloud for songs")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("query to search")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const songTitle = interaction.options.getString("query");
    const subcommand = interaction.options.getSubcommand();
    try {
      if (!interaction.member.voice.channel)
        return interaction.followUp({
          content: "Please join a voice channel first!",
        });
      await mongo().then(async (mongoose) => {
        let settings = await setup.findOne({ _id: interaction.guildId });

        if (
          settings.musicId.length > 0 &&
          interaction.member.id != interaction.guild.ownerId
        ) {
          let musicChannel = false;
          for (let index = 0; index < settings.musicId.length; index++) {
            const element = settings.musicId[index];
            if (element == interaction.member.voice.channel.id) {
              musicChannel = true;
            }
          }
          if (!musicChannel) {
            return interaction.followUp({
              content: "I am not allowed to play music in this voice channel!",
            });
          }
        }
        let result;
        if (subcommand == "youtube") {
          result = await client.distube.search(songTitle);
        } else {
          result = await SoundCloudPlugin.search(songTitle);
        }
        const select = new StringSelectMenuBuilder().setCustomId("search");

        let response = "";
        for (let index = 0; index < result.length; index++) {
          response += `${index + 1}. [${result[index].name}](${
            result[index].url
          })\n`;
          let label = `${index + 1}. ${result[index].name}`;
          if (label.length > 100) {
            label = label.slice(0, 97) + "...";
          }

          select.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(label)
              .setDescription(
                `${result[index].views} views - ${result[index].uploader.name}`
              )
              .setValue(`${result[index].url}`)
          );
        }
        const exampleEmbed = new EmbedBuilder()
          .setTitle(`Results for "${songTitle}"`)
          .setColor("#FF0000")
          .setDescription(response);

        interaction.editReply({
          embeds: [exampleEmbed],
          components: [new ActionRowBuilder().addComponents(select)],
        });
      });
    } catch (error) {
      interaction.editReply("An error occured");
      console.log(error);
    }
  },
};
