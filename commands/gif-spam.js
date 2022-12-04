const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gif-spam")
    .setDescription("Find when gifs have been spammed ;D")
    .addIntegerOption(option =>
			option
				.setName("limit")
				.setDescription("How many messages back you want to check rounded to the nearest 100")
        .setMinValue(1)
        .setMaxValue(10000)
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.channel
    const limit = Math.ceil((interaction.options.getInteger("limit") / 100) * 100)
    let spams = []
    let firstFetch = await channel.messages.fetch({ limit: 1})
    let firstMessageInPage
    firstFetch.forEach(element => firstMessageInPage = element.content)

    await interaction.reply("Searching... 🤖")

    for(let i = 0; i <= limit; i += 100) {
      const messages = await channel.messages.fetch({
        limit: limit < 100 ? limit : 100,
        before: firstMessageInPage.id
      })
      if(messages.size === 0) break
      let gifsInARow = 0
      let firstMessageInSpam
      firstMessageInPage = messages.at(messages.size-1)
      messages.reverse().forEach((message) => {
        if(message.content.includes("https://giphy.com/") || message.content.includes("https://tenor.com/")) {
          if(gifsInARow === 0) {
            firstMessageInSpam = message
          }
          gifsInARow++
        } else {
          gifsInARow = 0
        }

        if(gifsInARow === 10) {
          spams.push(firstMessageInSpam)
        }
      });
    }

    let temp = []
    let len = 15
    for(let i = 0; i < spams.length; i+=len) {
      temp = spams.slice(i, i+len)
      await interaction.followUp(`${temp.map(spam => `• [${spam.createdAt.toLocaleString("fi-FI", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })}](${spam.url})\n`).join("")}`)
    }
  }
}