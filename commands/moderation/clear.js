const {
  SlashCommandBuilder,
  ms,
  PermissionFlagsBits,
} = require("../../dependencies");
const { promisify } = require("util");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear a specific amount of messages from the channel")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of messages")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    interaction.deferReply({ ephemeral: true });
    const amount = interaction.options.getInteger("amount");
    const iterations = Math.floor(amount / 99);
    const remainder = amount % 99;

    const sleep = promisify(setTimeout);

    for (let index = 0; index <= iterations; index++) {
      const limit = index === iterations ? remainder : 99;
      const fetchedMessages = await interaction.channel.messages.fetch({
        limit,
      });
      const filtered = fetchedMessages.filter(
        (msg) => Date.now() - msg.createdTimestamp < ms("14 days")
      );
      if (filtered.size === 0) {
        break;
      }
      await interaction.channel.bulkDelete(filtered);
      if (index < iterations) {
        await sleep(1500);
      }
    }
    interaction.editReply("Clear Complete!");
  },
};
