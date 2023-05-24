const SUITS = ["♦", "♥", "♣️", "♠️"];
const VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
class Card {
  constructor(suit, value, emoji) {
    this.suit = suit;
    this.value = value;
    this.emoji = emoji;
  }
}

class Deck {
  constructor(cards) {
    this.cards = cards;
  }
  toString() {
    return JSON.stringify(this.cards);
  }

  shuffle() {
    for (let i = this.numberOfCards - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      const oldValue = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = oldValue;
    }
  }

  drawCard() {
    return this.cards.shift();
  }

  get numberOfCards() {
    return this.cards.length;
  }

  cardString(num) {
    let string = "";
    for (let i = 0; i < num; i++) {
      string += this.cards[i].emoji;
    }
    return string;
  }

  getHandValue() {
    let value = 0;
    let numAces = 0;
    for (let i = 0; i < this.numberOfCards; i++) {
      switch (this.cards[i].value) {
        case "K":
        case "Q":
        case "J":
          value += 10;
          break;
        case "A":
          value += 11;
          numAces++;
          break;
        default:
          value += parseInt(this.cards[i].value);
      }
    }
    while (value > 21 && numAces > 0) {
      value -= 10;
      numAces--;
    }
    return value;
  }
  getFirstCardValue() {
    switch (this.cards[0].value) {
      case "K":
      case "Q":
      case "J":
        return 10;
      case "A":
        return 11;
      default:
        return parseInt(this.cards[0].value);
    }
  }

  addCard(card) {
    this.cards.push(card);
  }

  saveDeckValues() {
    return this.cards.map((card) => card.value);
  }
  saveDeckSuits() {
    return this.cards.map((card) => card.suit);
  }
  saveDeckEmojis() {
    return this.cards.map((card) => card.emoji);
  }
  dealerDraw(deck) {
    while (this.getHandValue() < 17 && this.numberOfCards < 5) {
      this.addCard(deck.drawCard());
    }
  }

  getResults(dealerDeck) {
    let dealerNatural =
      dealerDeck.getHandValue == 21 && dealerDeck.numberOfCards == 2
        ? true
        : false;
    let playerNatural =
      this.getHandValue == 21 && this.numberOfCards == 2 ? true : false;

    if (
      (dealerDeck.getHandValue() <= 21 &&
        dealerDeck.getHandValue() > this.getHandValue()) ||
      (dealerNatural && !playerNatural) ||
      this.getHandValue() > 21
    ) {
      if (dealerNatural) {
        return ["Lose", "You Lose (Dealer Has Natural Blackjack)"];
      } else if (dealerDeck.getHandValue() == 21) {
        return ["Lose", "You Lose (Dealer Has A Blackjack)"];
      } else {
        return ["Lose", "You Lose"];
      }
    } else if (dealerDeck.getHandValue() == this.getHandValue()) {
      if (dealerNatural && playerNatural) {
        return ["Tie", "Tie (Dealer And Player Has A Natural Blackjack)"];
      } else {
        return ["Tie", "You Tied"];
      }
    } else {
      if (this.getHandValue() == 21) {
        if (this.numberOfCards == 2)
          return ["Win", "You Win (Natural Blackjack)"];
        else return ["Win", "You Win (Blackjack)"];
      } else return ["Win", "You Win"];
    }
  }
}

function freshDeck() {
  const deck = SUITS.flatMap((suit) => {
    return VALUES.map((value) => {
      let cardEmoji = "";
      switch (suit) {
        case "♥":
          switch (value) {
            case "A":
              cardEmoji = "<:AceOfHearts:1108634733623115857>";
              break;
            case "2":
              cardEmoji = "<:TwoOfHearts:1108634732306104320>";
              break;
            case "3":
              cardEmoji = "<:ThreeOfHearts:1108634593634041948>";
              break;
            case "4":
              cardEmoji = "<:FourOfHearts:1108634730871668766>";
              break;
            case "5":
              cardEmoji = "<:FiveOfHearts:1108634729277833236>";
              break;
            case "6":
              cardEmoji = "<:SixOfHearts:1108634590207279156>";
              break;
            case "7":
              cardEmoji = "<:SevenOfHearts:1108634589196460062>";
              break;
            case "8":
              cardEmoji = "<:EightOfHearts:1108634587963326534>";
              break;
            case "9":
              cardEmoji = "<:NineOfHearts:1108634586558246983>";
              break;
            case "10":
              cardEmoji = "<:TenOfHearts:1108634585551622236>";
              break;
            case "J":
              cardEmoji = "<:JackOfHearts:1108634584649830430>";
              break;
            case "Q":
              cardEmoji = "<:QueenOfHearts:1108634583194419250>";
              break;
            case "K":
              cardEmoji = "<:KingOfHearts:1108634581827076107>";
              break;
          }
          break;
        case "♦":
          switch (value) {
            case "A":
              cardEmoji = "<:AceOfDiamonds:1108638139016294430>";
              break;
            case "2":
              cardEmoji = "<:TwoOfDiamonds:1108638138127101952>";
              break;
            case "3":
              cardEmoji = "<:ThreeOfDiamonds:1108638137279852584>";
              break;
            case "4":
              cardEmoji = "<:FourOfDiamonds:1108638136365498368>";
              break;
            case "5":
              cardEmoji = "<:FiveOfDiamonds:1108638134851358783>";
              break;
            case "6":
              cardEmoji = "<:SixOfDiamonds:1108638087573147678>";
              break;
            case "7":
              cardEmoji = "<:SevenOfDiamonds:1108638086574919741>";
              break;
            case "8":
              cardEmoji = "<:EightOfDiamonds:1108638085643763723>";
              break;
            case "9":
              cardEmoji = "<:NineOfDiamonds:1108638084079308800>";
              break;
            case "10":
              cardEmoji = "<:TenOfDiamonds:1108638082900688936>";
              break;
            case "J":
              cardEmoji = "<:JackOfDiamonds:1108638081655001201>";
              break;
            case "Q":
              cardEmoji = "<:QueenOfDiamonds:1108638080900018177>";
              break;
            case "K":
              cardEmoji = "<:KingOfDiamonds:1108638079444590713>";
              break;
          }
          break;
        case "♣️":
          switch (value) {
            case "A":
              cardEmoji = "<:AceOfClubs:1108655630316748821>";
              break;
            case "2":
              cardEmoji = "<:TwoOfClubs:1108655628605460500>";
              break;
            case "3":
              cardEmoji = "<:ThreeOfClubs:1108655680430276618>";
              break;
            case "4":
              cardEmoji = "<:FourOfClubs:1108655678278611024>";
              break;
            case "5":
              cardEmoji = "<:FiveOfClubs:1108655623928811570>";
              break;
            case "6":
              cardEmoji = "<:SixOfClubs:1108655622825705523>";
              break;
            case "7":
              cardEmoji = "<:SevenOfClubs:1108655620418191430>";
              break;
            case "8":
              cardEmoji = "<:EightOfClubs:1108655619369607219>";
              break;
            case "9":
              cardEmoji = "<:NineOfClubs:1108655618291662969>";
              break;
            case "10":
              cardEmoji = "<:TenOfClubs:1108655616496504872>";
              break;
            case "J":
              cardEmoji = "<:JackOfClubs:1108655615280173116>";
              break;
            case "Q":
              cardEmoji = "<:QueenOfClubs:1108655613636001874>";
              break;
            case "K":
              cardEmoji = "<:KingOfClubs:1108655612272844890>";
              break;
          }
          break;
        case "♠️":
          switch (value) {
            case "A":
              cardEmoji = "<:AceOfSpades:1108673484218970122>";
              break;
            case "2":
              cardEmoji = "<:TwoOfSpades:1108673482155364372>";
              break;
            case "3":
              cardEmoji = "<:ThreeOfSpades:1108673425528074270>";
              break;
            case "4":
              cardEmoji = "<:FourOfSpades:1108673424311713792>";
              break;
            case "5":
              cardEmoji = "<:FiveOfSpades:1108673422218776607>";
              break;
            case "6":
              cardEmoji = "<:SixOfSpades:1108673420796895333>";
              break;
            case "7":
              cardEmoji = "<:SevenOfSpades:1108673419404398592>";
              break;
            case "8":
              cardEmoji = "<:EightOfSpades:1108673416883605544>";
              break;
            case "9":
              cardEmoji = "<:NineOfSpades:1108673415369457674>";
              break;
            case "10":
              cardEmoji = "<:TenOfSpades:1108673413356199956>";
              break;
            case "J":
              cardEmoji = "<:JackOfSpades:1108673411183542313>";
              break;
            case "Q":
              cardEmoji = "<:QueenOfSpades:1108673409333854208>";
              break;
            case "K":
              cardEmoji = "<:KingOfSpades:1108673407677116448>";
              break;
          }
          break;
      }
      return new Card(suit, value, cardEmoji);
    });
  });
  return deck;
}

module.exports = { Deck, freshDeck, Card };
