const mongoose = require("mongoose");
reqString = {
  type: String,
  required: true,
};
const autoMod = mongoose.Schema({
  word: [String],
  whitelistedChannels: [String],
  whitelistedRoles: [String],
  guildId: reqString,
});

const card = mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  backgroundColor: String,
  backgroundImage: String,
  textColor: String,
  progressbarColor: String,
});

const caseSchema = mongoose.Schema(
  {
    action: reqString,
    user: reqString,
    userId: reqString,
    guildId: reqString,
    reason: reqString,
    staffTag: reqString,
    duration: String,
    case: Number,
    expires: Date,
    current: Boolean,
    auto: Boolean,
    resolved: Boolean,
  },
  {
    timestamps: true,
  }
);

const customCommand = new mongoose.Schema({
  guildId: String,
  commandName: String,
  response: [String],
  description: String,
  ownerOnly: Boolean,
  permittedRoles: [String],
});

const playlistSchema = mongoose.Schema({
  name: reqString,
  guildId: reqString,
  songs: [String],
});

const reactionSchema = mongoose.Schema({
  channel: reqString,
  messageId: reqString,
  emoji: reqString,
  role: reqString,
  guildId: reqString,
});

const rewardsSchema = mongoose.Schema({
  level: reqString,
  role: reqString,
  guildId: reqString,
});

const setup = mongoose.Schema(
  {
    _id: reqString,
    moderationId: {
      type: String,
    },
    memberId: {
      type: String,
    },
    musicManagement: [String],
    dj: [String],
    musicId: [String],
    blacklist: {
      type: Boolean,
    },
    mention: {
      type: Boolean,
    },
    message: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const supportSchema = mongoose.Schema({
  guildId: reqString,
  category: reqString,
  reactionMessage: reqString,
  channel: reqString,
  welcomeMessage: {
    type: String,
  },
});

const ticketSchema = mongoose.Schema({
  guildId: reqString,
  channel: reqString,
  message: reqString,
});

const blackjackSchema = mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  currentDeck: {
    type: Number,
    required: true,
  },
  playerDecks: [
    {
      suits: [String],
      values: [String],
      emojis: [String],
      messageId: reqString,
    },
  ],
  dealerDeck: {
    suits: [String],
    values: [String],
    emojis: [String],
  },
  deck: {
    suits: [String],
    values: [String],
    emojis: [String],
  },
});

const infraction = mongoose.Schema({
  guildId: reqString,
  action: reqString,
  duration: String,
  time: String,
  infraction: { type: Number, required: true },
});

const models = {
  autoModSchema: mongoose.model("autoMod", autoMod),
  card: mongoose.model("card", card),
  caseSchema: mongoose.model("case", caseSchema),
  customCommandSchema: mongoose.model("custom-commands", customCommand),
  playlistSchema: mongoose.model("playlist", playlistSchema),
  reactionRoles: mongoose.model("reaction roles", reactionSchema),
  rewardsSchema: mongoose.model("rewards", rewardsSchema),
  setup: mongoose.model("setup", setup),
  supportSchema: mongoose.model("support", supportSchema),
  ticket: mongoose.model("ticket", ticketSchema),
  blackjack: mongoose.model("blackjack", blackjackSchema),
  infractionSchema: mongoose.model("infraction", infraction),
};

module.exports = models;
