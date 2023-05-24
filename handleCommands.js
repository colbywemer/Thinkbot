const {
  client,
  Routes,
  fs,
  CLIENT_ID,
  GUILD_ID,
  rest,
} = require("./dependencies");

const handleCommands = async () => {
  const commandsFolder = fs.readdirSync("./commands");
  for (const folder of commandsFolder) {
    const commandFiles = fs
      .readdirSync(`./commands/${folder}`)
      .filter((file) => file.endsWith(".js"));
    const { commands, commandArray } = client;
    for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      commands.set(command.data.name, command);
      commandArray.push(command.data.toJSON());
    }
  }

  // Register the commands
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: client.commandArray,
  });

  // delete all global commands
  //   await rest
  //     .put(Routes.applicationCommands(CLIENT_ID), { body: client.commandArray })
  //     .then(() => console.log("Successfully deleted all application commands."))
  //     .catch(console.error);
  // };
  await rest
    .put(Routes.applicationCommands(CLIENT_ID), { body: [] })
    .then(() => console.log("Successfully deleted all application commands."))
    .catch(console.error);
};
module.exports = { handleCommands };
