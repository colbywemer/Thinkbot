const {
  Collection,
  REST,
  Routes,
  Levels,
  client,
  customCommandSchema,
  EmbedBuilder,
  mongo,
  setup,
  caseSchema,
  reactionRoles,
  supportSchema,
  ticket,
  rewardsSchema,
  blacklistSchema,
  DisTube,
  SpotifyPlugin,
  mongooseConnectionString,
  TOKEN,
  ChannelType,
  PermissionFlagsBits,
  Events,
  ActivityType,
  SoundCloudPlugin,
} = require("./dependencies");
const { handleCommands } = require("./handleCommands");
const { handleComponents } = require("./handleComponents");
Levels.setURL(mongooseConnectionString);

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: true,
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin(), new SoundCloudPlugin()],
});
client.commands = new Collection();
client.commandArray = [];
client.buttons = new Collection();
client.selectMenus = new Collection();

async function updateChannels(guild, create) {
  let statsChannel = guild.channels.cache.find(
    (channel) => channel.name === "📊Server Stats📊"
  );
  if (statsChannel) {
    let usersChannel = null;
    let membersChannel = null;
    let botsChannel = null;
    statsChannel.children.cache.forEach((channel) => {
      if (channel.name.includes("Users")) {
        usersChannel = channel;
      }
      if (channel.name.includes("Members")) {
        membersChannel = channel;
      }
      if (channel.name.includes("Bots")) {
        botsChannel = channel;
      }
    });

    if (usersChannel == null && create == true) {
      guild.channels.create({
        name: `Total Users: ${guild.memberCount}`,
        type: ChannelType.GuildVoice,
        parent: statsChannel,
      });
    } else {
      guild.channels.cache
        .get(usersChannel.id)
        .setName(`Total Users: ${guild.memberCount}`);
    }
    if (membersChannel == null && create == true) {
      guild.channels.create({
        name: `Members: ${guild.members.cache.filter((m) => !m.user.bot).size}`,
        type: ChannelType.GuildVoice,
        parent: statsChannel,
      });
    } else {
      guild.channels.cache
        .get(membersChannel.id)
        .setName(
          `Members: ${guild.members.cache.filter((m) => !m.user.bot).size}`
        );
    }
    if (botsChannel == null && create == true) {
      guild.channels.create({
        name: `Bots: ${guild.members.cache.filter((m) => m.user.bot).size}`,
        type: ChannelType.GuildVoice,
        parent: statsChannel,
      });
    } else {
      guild.channels.cache
        .get(botsChannel.id)
        .setName(`Bots: ${guild.members.cache.filter((m) => m.user.bot).size}`);
    }
  } else if (create == true) {
    await guild.channels.create({
      name: "📊Server Stats📊",
      type: ChannelType.GuildCategory,
      position: 0,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.Connect],
        },
      ],
    });

    let statsChannel = guild.channels.cache.find(
      (channel) => channel.name === "📊Server Stats📊"
    );
    statsChannel.setPosition(0);

    guild.channels.create({
      name: `Total Users: ${guild.memberCount}`,
      type: ChannelType.GuildVoice,
      parent: statsChannel,
    });

    guild.channels.create({
      name: `Members: ${guild.members.cache.filter((m) => !m.user.bot).size}`,
      type: ChannelType.GuildVoice,
      parent: statsChannel,
    });

    guild.channels.create({
      name: `Bots: ${guild.members.cache.filter((m) => m.user.bot).size}`,
      type: ChannelType.GuildVoice,
      parent: statsChannel,
    });
  }
}

client.on(Events.ClientReady, async () => {
  handleCommands();
  handleComponents();

  await mongo().then(async (mongoose) => {
    customCommandSchema.find().then((data) => {
      data.forEach((cmd) => {
        const guild = client.guilds.cache.get(cmd.guildId);
        guild?.commands.create({
          name: cmd.commandName,
          description: cmd.description,
        });
      });
    });
  });
  client.user.setPresence({
    activities: [
      {
        name: "For Commands",
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  console.log(`${client.user.tag} has logged in!`);
});

client.on(Events.AutoModerationActionExecution, async (action) => {
  const autoMod = await setup.findOne({ _id: guildId });
  if (action.ruleTriggerType == 1 || action.ruleTriggerType == 4) {
    const reason = "Swearing";
    const user = action.user.tag;
    const userId = action.userId;
    const moderator = client.user.tag;
    const guildId = action.guild.id;
    await mongo().then(async (mongoose) => {
      let caseNumber = await caseSchema.find({ guildId: guildId });
      let count = caseNumber.length + 1;
      if (autoMod) {
        let channelId = autoMod.moderationId;
        let channel = action.guild.channels.cache.get(channelId);
        const exampleEmbed1 = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle(`Warn - Case #${count}`)
          .addFields(
            { name: "User", value: `${user}` },
            { name: "User ID", value: `${userId}` },
            { name: "Reason", value: `${reason}` },
            { name: `Moderator`, value: `${moderator}` }
          );
        await channel.send({ embeds: [exampleEmbed1] });
      }

      await new caseSchema({
        action: "Warn",
        user: user,
        userId: userId,
        guildId: guildId,
        reason: reason,
        staffTag: moderator,
        case: count,
        auto: true,
        resolved: false,
      }).save();
    });
  } else if (action.ruleTriggerType == 3) {
  } else if (action.ruleTriggerType == 5) {
  }
});
try {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName != "clear") {
        await interaction.deferReply();
      }
      if (!interaction.command) {
        const { commands } = client;
        const command = commands.get(interaction.commandName);
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          await interaction.editReply(
            "Something Went Wrong While Executing This Command..."
          );
        }
      } else {
        await mongo().then(async (mongoose) => {
          const customCommand = await customCommandSchema.findOne({
            commandName: interaction.commandName,
            guildId: interaction.guildId,
          });
          console.log(customCommand);
          if (
            customCommand.ownerOnly == true &&
            interaction.user.id != interaction.guild.ownerId
          ) {
            return interaction.editReply(
              "You do not have permission to use this command!"
            );
          }
          if (
            customCommand.permittedRoles.length != 0 &&
            interaction.user.id != interaction.guild.ownerId
          ) {
            let hasRole = false;
            for (
              let index = 0;
              index < customCommand.permittedRoles.length;
              index++
            ) {
              const element = customCommand.permittedRoles[index];
              if (
                interaction.guild.members.cache
                  .get(interaction.user.id)
                  .roles.cache.has(element)
              ) {
                hasRole = true;
                break;
              }
            }
            if (hasRole == false)
              return interaction.editReply(
                "You do not have permission to use this command!"
              );
          }
          let response = "";
          for (let index = 0; index < customCommand.response.length; index++) {
            const element = customCommand.response[index];
            response += element + "\n";
          }
          return interaction.editReply({ content: `${response}` });
        });
      }
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId.split("-")[0]);
      try {
        await button.execute(interaction);
      } catch (e) {
        console.error(e);
      }
    } else if (interaction.isAnySelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      try {
        await menu.execute(interaction);
      } catch (e) {
        console.error(e);
      }
    }
  });

  client.on(Events.GuildCreate, async (guild) => {
    const channel =
      guild.systemChannel ||
      guild.channels.cache.find((channel) => channel.name === "general");
    try {
      channel.send("Thanks for invite me");
    } catch (error) {
      console.log("There was an error");
    }
    updateChannels(guild, true);
  });
} catch (err) {
  console.log(err);
}

const checkBansAndMutes = async () => {
  console.log("Checking Bans And Mutes");
  let now = new Date();
  let conditionalBan = {
    expires: {
      $lt: now,
    },
    current: true,
    action: "Ban",
  };
  let conditionalMute = {
    expires: {
      $lt: now,
    },
    current: true,
    action: "Mute",
  };
  await mongo().then(async (mongoose) => {
    try {
      let results = await caseSchema.find(conditionalBan);
      if (results && results.length) {
        for (let result of results) {
          let { guildId, userId } = result;
          let guild = client.guilds.cache.get(guildId);

          try {
            guild.members.unban(userId);
            try {
              let caseNumber = await caseSchema.find({ guildId: guild.id });
              let count = caseNumber.length + 1;
              await new caseSchema({
                action: "Unban",
                user: result.user,
                userId: userId,
                guildId: guild.id,
                reason: "Time Expired",
                staffTag: client.user.tag,
                case: count,
                auto: true,
                resolved: false,
              }).save();

              const banmod = await setup.findOne({ _id: guild.id });
              if (banmod) {
                let channelId = banmod.moderationId;
                let channel = guild.channels.cache.get(channelId);
                const exampleEmbed1 = new EmbedBuilder()
                  .setColor("#FF0000")
                  .setTitle(`Unban - Case #${count}`)
                  .addFields(
                    { name: "User", value: `${result.user}` },
                    { name: "User ID", value: `${userId}` },
                    { name: "Reason", value: `Time Expired` },
                    { name: `Moderator`, value: `${client.user.tag}` }
                  );
                await channel.send({ embeds: [exampleEmbed1] });
              }
            } catch (error) {
              console.log("Error sending message to channel");
              console.log(error);
            }
          } catch (error) {
            console.log("There was an error unbaning the user");
          }
        }
        await caseSchema.updateMany(conditionalBan, {
          current: false,
        });
      }
      let results2 = await caseSchema.find(conditionalMute);
      if (results2 && results2.length) {
        for (let result2 of results2) {
          let { guildId, userId } = result2;
          let guild = client.guilds.cache.get(guildId);
          let member = (await guild.members.fetch()).get(userId);
          try {
            let caseNumber = await caseSchema.find({ guildId: guild.id });
            let count = caseNumber.length + 1;
            await new caseSchema({
              action: "Unmute",
              user: member.user.tag,
              userId: member.id,
              guildId: guild.id,
              reason: "Time Expired",
              staffTag: client.user.tag,
              case: count,
              auto: true,
              resolved: false,
            }).save();

            const mutemod = await setup.findOne({ _id: guild.id });
            if (mutemod) {
              let channelId = mutemod.moderationId;
              let channel = guild.channels.cache.get(channelId);
              const exampleEmbed1 = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`Unmute - Case #${count}`)
                .addFields(
                  { name: "User", value: `${member.user.tag}` },
                  { name: "User ID", value: `${member.id}` },
                  { name: "Reason", value: `Time Expired` },
                  { name: `Moderator`, value: `${client.user.tag}` }
                );
              await channel.send({ embeds: [exampleEmbed1] });
            }
          } catch (error) {
            console.log("Error sending message to channel");
            console.log(error);
          }
        }
        await caseSchema.updateMany(conditionalMute, {
          current: false,
        });
      }
    } catch (error) {
    } finally {
      mongoose.connection.close();
    }
  });
  setTimeout(checkBansAndMutes, 1000 * 60);
};
checkBansAndMutes();

client.on(Events.MessageReactionAdd, async (reaction, user, message) => {
  console.log("Clicked");
  if (user.id === client.user.id) return;
  await mongo().then(async (mongoose) => {
    try {
      let support = await supportSchema.findOne({
        guildId: reaction.message.guildId,
        reactionMessage: reaction.message.id,
      });
      if (support) {
        reaction.users.remove(user.id);
        if (reaction.emoji.name != "✅") return;
        let category = reaction.message.guild.channels.cache.find(
          (channel) => channel.id === support.category
        );
        if (
          !reaction.message.guild.channels.cache.find(
            (channel) =>
              channel.name ===
              `ticket-${user.username.toLowerCase()}${user.discriminator}`
          )
        ) {
          const ticketChannel = await reaction.message.guild.channels.create({
            name: `ticket-${user.username}${user.discriminator}`,
            type: ChannelType.GuildText,
            parent: category,
          });

          let newChannel;
          if (support.welcomeMessage == null) {
            newChannel = await ticketChannel.send(
              `React with the X on this message to close the ticket!`
            );
          } else {
            let messageText = "";
            let message = support.welcomeMessage;
            message = message.split("(/n)");
            for (let index = 0; index < message.length; index++) {
              messageText += message[index] + "\n";
            }
            messageText = messageText.trim();
            newChannel = await ticketChannel.send(
              `${messageText}\nReact with the X on this message to close the ticket!`
            );
          }
          newChannel.react("❌");
          ticketChannel.lockPermissions();
          ticketChannel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
          });

          await ticket.create({
            guildId: reaction.message.guildId,
            channel: ticketChannel.id,
            message: newChannel.id,
          });
        }
      }

      const found = await ticket.findOne({
        guildId: reaction.message.guildId,
        channel: reaction.message.channelId,
        message: reaction.message.id,
      });
      if (found && reaction.emoji.name != "❌") {
        reaction.users.remove(user.id);
      }
      if (reaction.emoji.name == "❌" && user.id != client.user.id && found) {
        let channel = reaction.message.guild.channels.cache.find(
          (channel) => channel.id === found.channel
        );
        channel.delete();
        await ticket.findOneAndDelete({
          guildId: reaction.message.guildId,
          channel: reaction.message.channelId,
          message: reaction.message.id,
        });
      }

      let test = await reactionRoles.findOne({
        guildId: reaction.message.guildId,
        messageId: reaction.message.id,
        emoji: reaction.emoji.toString(),
      });
      if (test) {
        let role = reaction.message.guild.roles.cache.find((role) => {
          return role.id === test.role;
        });
        await reaction.message.guild.members.cache
          .get(user.id)
          .roles.add(role.id);
      }
    } finally {
    }
  });
});
client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (user.bot) return;
  await mongo().then(async (mongoose) => {
    try {
      let test = await reactionRoles.findOne({
        guildId: reaction.message.guildId,
        messageId: reaction.message.id,
        emoji: reaction.emoji.toString(),
      });
      if (test) {
        let role = reaction.message.guild.roles.cache.find((role) => {
          return role.id === test.role;
        });
        await reaction.message.guild.members.cache
          .get(user.id)
          .roles.remove(role.id);
      }
    } finally {
    }
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    if (!member.user.bot) {
      Levels.createUser(member.id, member.guild.id);
    }
  } catch (error) {}
  await mongo().then(async (mongoose) => {
    try {
      const result = await setup.findOne({ _id: member.guild.id });
      if (result) {
        let channelId = result.memberId;
        let channel = member.guild.channels.cache.get(channelId);
        const message =
          "**" +
          member.user.username +
          " has joined the server**" +
          "\n There is now " +
          member.guild.memberCount +
          " members in the server.";
        channel.send(message);
      }
    } finally {
      mongoose.connection.close();
    }
  });
  updateChannels(member.guild, false);
});
client.on(Events.GuildMemberRemove, async (member) => {
  if (member.user.id == client.user.id) return;
  await mongo().then(async (mongoose) => {
    try {
      const result = await setup.findOne({ _id: member.guild.id });
      if (result) {
        let channelId = result.memberId;
        let channel = member.guild.channels.cache.get(channelId);
        const message =
          "**" +
          member.user.username +
          " has left the server**" +
          "\n There is now " +
          member.guild.memberCount +
          " members in the server.";
        channel.send(message);
      }
    } finally {
      mongoose.connection.close();
    }
  });
  updateChannels(member.guild, false);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.channelId == 925696972793462825) {
    const exampleEmbed = new EmbedBuilder()
      .setTitle(`Suggestion by ${message.author.tag}`)
      .setDescription(`${message.toString()}`)
      .setColor("#FF0000");
    let messageToReact = await message.channel.send({ embeds: [exampleEmbed] });
    message.delete();
    await messageToReact.react("✅");
    messageToReact.react("❌");
  }

  await mongo().then(async (mongoose) => {
    try {
      const randomXp = Math.floor(Math.random() * (40 - 15 + 1) + 15);
      const hasLeveledUp = await Levels.appendXp(
        message.author.id,
        message.guild.id,
        randomXp
      );
      if (hasLeveledUp) {
        const user = await Levels.fetch(message.author.id, message.guild.id);
        message.channel.send(
          `${message.author.tag} has leveled up to level ${user.level}.`
        );
        try {
          let rewards = await rewardsSchema.find({ guildId: message.guildId });
          for (let index = 0; index < rewards.length; index++) {
            let level = parseInt(rewards[index].level);
            if (level <= user.level) {
              let member = (await message.guild.members.fetch()).get(
                message.author.id
              );
              let role = message.guild.roles.cache.find(
                (r) => r.id == rewards[index].role
              );
              let bot = message.guild.members.cache.get(client.user.id);
              if (!member.roles.cache.has(role.id)) {
                if (role.position < bot.roles.highest.position)
                  user.roles.add(role);
                else {
                  let owner = interaction.guild.members.cache.get(
                    member.guild.ownerId
                  );
                  owner.send(
                    `I was unable to give ${member.user.tag} their rank reward of ${role.name} because I am a lower position than the rewarded role! Please go into the roles tab in the server settings and make sure that a role that I have is above all rank reward roles!`
                  );
                }
              }
              member.roles.add(role);
            }
          }
        } catch (error) {}
      }
    } finally {
    }
  });
});

client.login(TOKEN);
