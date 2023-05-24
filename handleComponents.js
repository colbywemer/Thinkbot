const { fs, client } = require("./dependencies");
const handleComponents = async () => {
  const componentsFolder = fs.readdirSync("./components");
  for (const folder of componentsFolder) {
    const componentFiles = fs
      .readdirSync(`./components/${folder}`)
      .filter((file) => file.endsWith(".js"));

    const { buttons, selectMenus } = client;
    switch (folder) {
      case "buttons":
        for (const file of componentFiles) {
          const button = require(`./components/${folder}/${file}`);
          buttons.set(button.data.name, button);
        }
        break;
      case "selectMenu":
        for (const file of componentFiles) {
          const selectMenu = require(`./components/${folder}/${file}`);
          selectMenus.set(selectMenu.data.name, selectMenu);
        }
        break;
      default:
        break;
    }
  }
};
module.exports = { handleComponents };
