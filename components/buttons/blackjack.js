const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  blackjack,
  mongo,
  Deck,
  Card,
} = require("../../dependencies");

module.exports = {
  data: {
    name: "blackjack",
  },
  async execute(interaction) {
    await mongo().then(async (mongoose) => {
      try {
        let deckData = await blackjack.findOne({
          guildId: interaction.guildId,
          "playerDecks.messageId": interaction.message.id,
          userId: interaction.user.id,
        });

        if (deckData) {
          let i = deckData.currentDeck - 1;
          let playerDeck = new Deck(
            deckData.playerDecks[i].suits.map(
              (suit, index) =>
                new Card(
                  suit,
                  deckData.playerDecks[i].values[index],
                  deckData.playerDecks[i].emojis[index]
                )
            )
          );
          let dealerDeck = new Deck(
            deckData.dealerDeck.suits.map(
              (suit, index) =>
                new Card(
                  suit,
                  deckData.dealerDeck.values[index],
                  deckData.dealerDeck.emojis[index]
                )
            )
          );
          let deck = new Deck(
            deckData.deck.suits.map(
              (suit, index) =>
                new Card(
                  suit,
                  deckData.deck.values[index],
                  deckData.deck.emojis[index]
                )
            )
          );
          const action = interaction.customId.split("-")[1];
          let insurance = interaction.customId.split("-")[2];
          let result;
          if (action == "hit") {
            playerDeck.addCard(deck.drawCard());
            deckData.playerDecks.splice(i, 1, {
              suits: playerDeck.saveDeckSuits(),
              values: playerDeck.saveDeckValues(),
              emojis: playerDeck.saveDeckEmojis(),
              messageId: interaction.message.id,
            });
            deckData.deck = {
              suits: deck.saveDeckSuits(),
              values: deck.saveDeckValues(),
              emojis: deck.saveDeckEmojis(),
            };
            await deckData.save();
          } else if (action == "double") {
            playerDeck.addCard(deck.drawCard());
            deckData.playerDecks.splice(i, 1, {
              suits: playerDeck.saveDeckSuits(),
              values: playerDeck.saveDeckValues(),
              emojis: playerDeck.saveDeckEmojis(),
              messageId: interaction.message.id,
            });
            deckData.deck = {
              suits: deck.saveDeckSuits(),
              values: deck.saveDeckValues(),
              emojis: deck.saveDeckEmojis(),
            };
            await deckData.save();
          } else if (action == "split") {
            const splitDeck1 = new Deck([playerDeck.cards[0]]);
            const splitDeck2 = new Deck([playerDeck.cards[1]]);

            splitDeck1.addCard(deck.drawCard());
            splitDeck2.addCard(deck.drawCard());
            playerDeck = splitDeck1;

            deckData.playerDecks.splice(i, 1, {
              suits: splitDeck1.saveDeckSuits(),
              values: splitDeck1.saveDeckValues(),
              emojis: splitDeck1.saveDeckEmojis(),
              messageId: interaction.message.id,
            });

            deckData.playerDecks.push({
              suits: splitDeck2.saveDeckSuits(),
              values: splitDeck2.saveDeckValues(),
              emojis: splitDeck2.saveDeckEmojis(),
              messageId: interaction.message.id,
            });
            deckData.deck = {
              suits: deck.saveDeckSuits(),
              values: deck.saveDeckValues(),
              emojis: deck.saveDeckEmojis(),
            };
            await deckData.save();
          } else if (action == "insurance") {
            insurance = "i";
            if (dealerDeck.getHandValue() == 21) {
              result = "Insurance Bet Won (You Lose)";
              await blackjack.findOneAndDelete({
                guildId: interaction.guildId,
                "playerDecks.messageId": interaction.message.id,
              });
            } else {
              result = "Insurance Bet Lost (Game Continues)";
            }
          }
          if (
            playerDeck.getHandValue() >= 21 ||
            action == "stand" ||
            action == "double"
          ) {
            if (
              deckData.playerDecks.length != deckData.currentDeck &&
              action != "double"
            ) {
              let exampleEmbed1 = new EmbedBuilder()
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
                  insurance == "i"
                    ? {
                        name: `Dealers Hand`,
                        value: `${dealerDeck.cardString(
                          2
                        )}\n\nValue: ${dealerDeck.getHandValue()}`,
                        inline: true,
                      }
                    : {
                        name: `Dealers Hand`,
                        value: `${dealerDeck.cardString(
                          1
                        )}<:CardBack:1108676544043425812>\n\nValue: ${dealerDeck.getFirstCardValue()}`,
                        inline: true,
                      }
                );
              await interaction.message.edit({
                embeds: [exampleEmbed1],
                components: [],
              });
              let i = deckData.currentDeck;
              playerDeck = new Deck(
                deckData.playerDecks[i].suits.map(
                  (suit, index) =>
                    new Card(
                      suit,
                      deckData.playerDecks[i].values[index],
                      deckData.playerDecks[i].emojis[index]
                    )
                )
              );
              const hitButton = new ButtonBuilder()
                .setCustomId("blackjack-hit")
                .setStyle(ButtonStyle.Primary)
                .setLabel("Hit");
              const standButton = new ButtonBuilder()
                .setCustomId("blackjack-stand")
                .setStyle(ButtonStyle.Primary)
                .setLabel("Stand");
              const splitButton = new ButtonBuilder()
                .setCustomId("blackjack-split")
                .setStyle(ButtonStyle.Primary)
                .setLabel("Stand");
              if (insurance == "i") {
                hitButton.setCustomId("blackjack-hit-i");
                standButton.setCustomId("blackjack-stand-i");
                splitButton.setCustomId("blackjack-split-i");
              }
              let components = [hitButton, standButton];
              if (playerDeck.cards[0].value == playerDeck.cards[1].value) {
                components.push(splitButton);
              }

              let exampleEmbed2 = new EmbedBuilder()
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
                  insurance == "i"
                    ? {
                        name: `Dealers Hand`,
                        value: `${dealerDeck.cardString(
                          2
                        )}\n\nValue: ${dealerDeck.getHandValue()}`,
                        inline: true,
                      }
                    : {
                        name: `Dealers Hand`,
                        value: `${dealerDeck.cardString(
                          1
                        )}<:CardBack:1108676544043425812>\n\nValue: ${dealerDeck.getFirstCardValue()}`,
                        inline: true,
                      }
                );
              if (action == "insurance") {
                exampleEmbed2.setDescription(`Results: ${result}`);
              }
              let deferMessage = await interaction.deferReply();
              console.log(deferMessage);
              const sentMessage = await interaction.editReply({
                embeds: [exampleEmbed2],
                components:
                  dealerDeck.getHandValue() == 21 && action == "insurance"
                    ? []
                    : [new ActionRowBuilder().addComponents(components)],
              });

              deckData = await blackjack.findOneAndUpdate(
                {
                  guildId: interaction.guildId,
                  "playerDecks.messageId": interaction.message.id,
                },
                {
                  $set: {
                    [`playerDecks.${i}.suits`]: playerDeck.saveDeckSuits(),
                    [`playerDecks.${i}.values`]: playerDeck.saveDeckValues(),
                    [`playerDecks.${i}.emojis`]: playerDeck.saveDeckEmojis(),
                    [`playerDecks.${i}.messageId`]: sentMessage.id,
                    currentDeck: deckData.currentDeck + 1,
                  },
                },
                {
                  new: true,
                }
              );
            } else {
              dealerDeck.dealerDraw(deck);
              for (let i = 0; i < deckData.playerDecks.length; i++) {
                const message = await interaction.channel.messages.fetch(
                  deckData.playerDecks[i].messageId
                );
                let playerDeck = new Deck(
                  deckData.playerDecks[i].suits.map(
                    (suit, index) =>
                      new Card(
                        suit,
                        deckData.playerDecks[i].values[index],
                        deckData.playerDecks[i].emojis[index]
                      )
                  )
                );

                let results = playerDeck.getResults(dealerDeck);
                if (results[0] == "Win") {
                  // credits logic for win
                } else if (results[0] == "Tie") {
                  // credits logic for tie
                } else {
                  // credits logic for lose
                }

                let exampleEmbed = new EmbedBuilder()
                  .setColor("#FF0000")
                  .setTitle(`Blackjack`)
                  .setDescription(`Results: ${results[1]}`)
                  .addFields(
                    deckData.playerDecks.length > 1
                      ? {
                          name: `Your Hand #${i + 1}`,
                          value: `${playerDeck.cardString(
                            playerDeck.numberOfCards
                          )}\n\nValue: ${playerDeck.getHandValue()}`,
                          inline: true,
                        }
                      : {
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

                await message.edit({
                  embeds: [exampleEmbed],
                  components: [],
                });
              }
              interaction.deferUpdate();
              deckData = await blackjack.findOneAndDelete({
                guildId: interaction.guildId,
                "playerDecks.messageId": interaction.message.id,
              });
            }
          } else {
            const hitButton = new ButtonBuilder()
              .setCustomId("blackjack-hit")
              .setStyle(ButtonStyle.Primary)
              .setLabel("Hit");
            const standButton = new ButtonBuilder()
              .setCustomId("blackjack-stand")
              .setStyle(ButtonStyle.Primary)
              .setLabel("Stand");
            if (insurance == "i") {
              hitButton.setCustomId("blackjack-hit-i");
              standButton.setCustomId("blackjack-stand-i");
            }
            let components = [hitButton, standButton];

            let exampleEmbed1 = new EmbedBuilder()
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
                insurance == "i"
                  ? {
                      name: `Dealers Hand`,
                      value: `${dealerDeck.cardString(
                        2
                      )}\n\nValue: ${dealerDeck.getHandValue()}`,
                      inline: true,
                    }
                  : {
                      name: `Dealers Hand`,
                      value: `${dealerDeck.cardString(
                        1
                      )}<:CardBack:1108676544043425812>\n\nValue: ${dealerDeck.getFirstCardValue()}`,
                      inline: true,
                    }
              );
            if (action == "insurance") {
              exampleEmbed1.setDescription(`Results: ${result}`);
            }

            await interaction.message.edit({
              embeds: [exampleEmbed1],
              components:
                dealerDeck.getHandValue() == 21 && action == "insurance"
                  ? []
                  : [new ActionRowBuilder().addComponents(components)],
            });
            interaction.deferUpdate();
          }
        } else {
          interaction.deferUpdate();
        }
      } finally {
        mongoose.connection.close();
      }
    });

    return;
  },
};
