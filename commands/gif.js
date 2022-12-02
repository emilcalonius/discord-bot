const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs")
const fetch = require('node-fetch')
const GIPHY_URL = `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_TOKEN}&tag=&rating=g`


module.exports = {
  data: new SlashCommandBuilder()
    .setName("gif")
    .setDescription("Replies with a random gif"),
  async execute(interaction) {
    const response = await fetch(GIPHY_URL)
    const data = await response.json()

    await interaction.reply(data.data.url)
  }
}