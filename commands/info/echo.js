const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("echo's your message")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("message that you want to echo")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("user to send message to")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const messageToSend = interaction.options.getString("message");
    const user = interaction.options.getUser("target");
    if (user) {
      if (!user.bot) {
        user.send({
          content: messageToSend,
        });
        interaction.editReply({
          content: `I sent the message to ${user.tag}`,
        });
      } else {
        interaction.editReply({
          content: `I can not send a message to ${user.tag} because they are a bot!`,
        });
      }
    } else {
      console.log(messageToSend);
      interaction.editReply({
        content: messageToSend,
      });
    }
  },
};
