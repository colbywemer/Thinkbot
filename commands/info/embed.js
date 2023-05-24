const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  validateColor,
  isImageURL,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("echo's your message in an embed")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Send message to a user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("user to send message to")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(4096)
        )
        .addStringOption((option) =>
          option
            .setName("color")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("thumbnail")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("footer-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(2048)
        )
        .addStringOption((option) =>
          option
            .setName("footer-image")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("author-name")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("author-image")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("author-url")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("timestamp")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("field1-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field1-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addStringOption((option) =>
          option
            .setName("field2-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field2-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addStringOption((option) =>
          option
            .setName("field3-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field3-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addStringOption((option) =>
          option
            .setName("field4-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field4-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addStringOption((option) =>
          option
            .setName("field5-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field5-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addBooleanOption((option) =>
          option
            .setName("inline")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Send message to a channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("channel to send message to")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(4096)
        )
        .addStringOption((option) =>
          option
            .setName("color")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("thumbnail")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("footer-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(2048)
        )
        .addStringOption((option) =>
          option
            .setName("footer-image")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("author-name")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("author-image")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("author-url")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("timestamp")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("field1-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field1-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addStringOption((option) =>
          option
            .setName("field2-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field2-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addStringOption((option) =>
          option
            .setName("field3-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field3-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addStringOption((option) =>
          option
            .setName("field4-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field4-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addStringOption((option) =>
          option
            .setName("field5-text")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(256)
        )
        .addStringOption((option) =>
          option
            .setName("field5-value")
            .setDescription("message that you want to echo")
            .setRequired(false)
            .setMaxLength(1024)
        )
        .addBooleanOption((option) =>
          option
            .setName("inline")
            .setDescription("message that you want to echo")
            .setRequired(false)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const channel = interaction.options.getChannel("channel");
    const title = interaction.options.getString("title");
    const color = interaction.options.getString("color");
    const url = interaction.options.getString("url");
    const authorName = interaction.options.getString("author-name");
    const authorUrl = interaction.options.getString("author-url");
    const authorImage = interaction.options.getString("author-image");
    let description = interaction.options.getString("description");
    const thumbnail = interaction.options.getString("thumbnail");
    const image = interaction.options.getString("image");
    const footerText = interaction.options.getString("footer-text");
    const footerImage = interaction.options.getString("footer-image");
    const inline = interaction.options.getBoolean("inline") || false;
    const timestamp = interaction.options.getBoolean("timestamp") || false;
    let field1Value = interaction.options.getString("field1-value");
    const field1Text = interaction.options.getString("field1-text");
    let field2Value = interaction.options.getString("field2-value");
    const field2Text = interaction.options.getString("field2-text");
    let field3Value = interaction.options.getString("field3-value");
    const field3Text = interaction.options.getString("field3-text");
    let field4Value = interaction.options.getString("field4-value");
    const field4Text = interaction.options.getString("field4-text");
    let field5Value = interaction.options.getString("field5-value");
    const field5Text = interaction.options.getString("field5-text");
    const subCommand = interaction.options.getSubcommand();

    if (image) {
      if (!(await isImageURL(image))) {
        return;
      }
    }
    if (thumbnail) {
      if (!(await isImageURL(thumbnail))) {
        return;
      }
    }
    if (footerImage) {
      if (!(await isImageURL(footerImage)) && footerImage != "avatar") {
        return;
      }
    }
    if (authorImage) {
      if (!(await isImageURL(authorImage)) && authorImage != "avatar") {
        return;
      }
    }
    if (color) {
      if (!validateColor.validateHTMLColorHex(color)) {
        return;
      }
    }
    description = description.replaceAll("(/n)", "\n");

    let embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(color)
      .setURL(url)
      .setDescription(description)
      .setThumbnail(thumbnail)
      .setImage(image)
      .setFooter({
        text: !footerText && footerImage ? "\u200B" : footerText,
        iconURL:
          footerImage == "avatar"
            ? interaction.user.displayAvatarURL({ dynamic: true })
            : footerImage,
      })
      .setAuthor({
        name: !authorName && authorImage ? "\u200B" : authorName,
        iconURL:
          authorImage == "avatar"
            ? interaction.user.displayAvatarURL({ dynamic: true })
            : authorImage,
        url: authorUrl,
      });

    if (timestamp) {
      embed.setTimestamp();
    }
    if (field1Text || field1Value) {
      field1Value = field1Value.replaceAll("(/n)", "\n");
      embed.addFields({
        name: field1Text ? field1Text : "\u200B",
        value: field1Value ? field1Value : "\u200B",
        inline: inline,
      });
    }
    if (field2Text || field2Value) {
      field2Value = field2Value.replaceAll("(/n)", "\n");
      embed.addFields({
        name: field2Text ? field2Text : "\u200B",
        value: field2Value ? field2Value : "\u200B",
        inline: inline,
      });
    }
    if (field3Text || field3Value) {
      field3Value = field3Value.replaceAll("(/n)", "\n");
      embed.addFields({
        name: field3Text ? field3Text : "\u200B",
        value: field3Value ? field3Value : "\u200B",
        inline: inline,
      });
    }
    if (field4Text || field4Value) {
      field4Value = field4Value.replaceAll("(/n)", "\n");
      embed.addFields({
        name: field4Text ? field4Text : "\u200B",
        value: field4Value ? field4Value : "\u200B",
        inline: inline,
      });
    }
    if (field5Text || field5Value) {
      field5Value = field5Value.replaceAll("(/n)", "\n");
      embed.addFields({
        name: field5Text ? field5Text : "\u200B",
        value: field5Value ? field5Value : "\u200B",
        inline: inline,
      });
    }

    if (subCommand == "channel") {
      channel.send({ embeds: [embed] });
      embed = new EmbedBuilder()
        .setTitle(`Sent Embed To ${channel}`)
        .setColor("#FF0000");
      interaction.editReply({ embeds: [embed] });
    } else {
      user.send({ embeds: [embed] });
      embed = new EmbedBuilder()
        .setTitle(`Sent Embed To ${user.tag}`)
        .setColor("#FF0000");
      interaction.editReply({ embeds: [embed] });
    }
  },
};
