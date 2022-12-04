const { REST, Routes } = require('discord.js');
require("dotenv").config()

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, '1048031375292383343'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// for global commands
// rest.delete(Routes.applicationCommand(clientId, 'commandId'))
// 	.then(() => console.log('Successfully deleted application command'))
// 	.catch(console.error);