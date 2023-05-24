require("dotenv").config();
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const mongooseConnectionString = process.env.mongooseConnectionString;
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder,
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Discord,
  Intents,
  Collection,
  AttachmentBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  ChannelType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Events,
  Partials,
  ActivityType,
} = require("discord.js");
const bar = require(`stylish-text`);
const rest = new REST({ version: "10" }).setToken(TOKEN);
const moment = require("moment");
const mongoose = require("mongoose");
const mongo = require("./mongo");
const ms = require("ms");
const Levels = require("discord-xp");
const validateColor = require("validate-color");
const isImageURL = require("image-url-validator").default;
const fs = require("fs");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const {
  blacklistSchema,
  card,
  caseSchema,
  customCommandSchema,
  playlistSchema,
  reactionRoles,
  rewardsSchema,
  setup,
  supportSchema,
  ticket,
  blackjack,
  infractionSchema,
} = require("./schemas");
const canvacord = require("./canvacord");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const { freshDeck, Card, Deck } = require("./deck");
const Genius = require("genius-lyrics");
module.exports = {
  freshDeck,
  Card,
  Deck,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Events,
  ChannelType,
  PermissionFlagsBits,
  Collection,
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionsBitField,
  ButtonBuilder,
  ActivityType,
  ButtonStyle,
  ActionRowBuilder,
  moment,
  CommandInteraction,
  ms,
  validateColor,
  isImageURL,
  mongoose,
  mongo,
  Levels,
  client,
  blacklistSchema,
  card,
  caseSchema,
  customCommandSchema,
  playlistSchema,
  reactionRoles,
  rewardsSchema,
  setup,
  supportSchema,
  blackjack,
  infractionSchema,
  ticket,
  DisTube,
  SpotifyPlugin,
  SoundCloudPlugin,
  ytdl,
  ytpl,
  TOKEN,
  mongooseConnectionString,
  fs,
  rest,
  GUILD_ID,
  CLIENT_ID,
  canvacord,
  AttachmentBuilder,
  bar,
  Genius,
};
