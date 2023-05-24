const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  blackjack,
  mongo,
  Deck,
  freshDeck,
} = require("../../dependencies");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("start a blackjack game"),
  async execute(interaction) {
    let deck = new Deck(freshDeck());
    let playerDeck = new Deck([]);
    let dealerDeck = new Deck([]);
    deck.shuffle();
    playerDeck.addCard(deck.drawCard());
    playerDeck.addCard(deck.drawCard());
    dealerDeck.addCard(deck.drawCard());
    dealerDeck.addCard(deck.drawCard());
    if (playerDeck.getHandValue() == 21) {
      dealerDeck.dealerDraw(deck);
      let result;
      if (dealerDeck.getHandValue() == 21 && dealerDeck.numberOfCards == 2) {
        result = "Results: Tie (Dealer And Player Has A Natural Blackjack)";
      } else {
        result = "Results: You Win (Natural Blackjack)";
      }
      const exampleEmbed1 = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`Blackjack`)
        .setDescription(result)
        .addFields(
          {
            name: "Your Hand",
            value: `${playerDeck.cardString(
              playerDeck.numberOfCards
            )}\n\nValue: ${playerDeck.getHandValue()}`,
            inline: true,
          },
          {
            name: `Dealers Hand`,
            value: `${dealerDeck.cardString(
              dealerDeck.numberOfCards
            )}\n\nValue: ${dealerDeck.getHandValue()}`,
            inline: true,
          }
        );
      return await interaction.editReply({
        embeds: [exampleEmbed1],
      });
    }
    const hitButton = new ButtonBuilder()
      .setCustomId("blackjack-hit")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Hit");
    const standButton = new ButtonBuilder()
      .setCustomId("blackjack-stand")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Stand");
    const doubleButton = new ButtonBuilder()
      .setCustomId("blackjack-double")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Double");
    const splitButton = new ButtonBuilder()
      .setCustomId("blackjack-split")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Split");
    const insuranceButton = new ButtonBuilder()
      .setCustomId("blackjack-insurance")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Insurance");

    let components = [hitButton, standButton, doubleButton];
    if (playerDeck.cards[0].value === playerDeck.cards[1].value)
      components.push(splitButton);
    if (dealerDeck.getFirstCardValue() == 11) components.push(insuranceButton);

    const exampleEmbed1 = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle(`Blackjack`)
      .addFields(
        {
          name: "Your Hand",
          value: `${playerDeck.cardString(
            playerDeck.numberOfCards
          )}\n\nValue: ${playerDeck.getHandValue()}`,
          inline: true,
        },
        {
          name: `Dealers Hand`,
          value: `${dealerDeck.cardString(
            1
          )}<:CardBack:1108676544043425812>\n\nValue: ${dealerDeck.getFirstCardValue()}`,
          inline: true,
        }
      );
    let reply = await interaction.editReply({
      embeds: [exampleEmbed1],
      components: [new ActionRowBuilder().addComponents(components)],
    });
    await mongo().then(async (mongoose) => {
      try {
        await blackjack.create({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          currentDeck: 1,
          playerDecks: [
            {
              suits: playerDeck.saveDeckSuits(),
              values: playerDeck.saveDeckValues(),
              emojis: playerDeck.saveDeckEmojis(),
              messageId: reply.id,
            },
          ],
          dealerDeck: {
            suits: dealerDeck.saveDeckSuits(),
            values: dealerDeck.saveDeckValues(),
            emojis: dealerDeck.saveDeckEmojis(),
          },
          deck: {
            suits: deck.saveDeckSuits(),
            values: deck.saveDeckValues(),
            emojis: deck.saveDeckEmojis(),
          },
        });
      } finally {
        mongoose.connection.close();
      }
    });
  },
};
