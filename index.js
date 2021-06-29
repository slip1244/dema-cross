const Bybit = require("./bybit.js")
const config = require("./config.json")
const DEMA_CROSS = require("./dema-cross.js")
const http = require('http');
const Discord = require("discord.js")
const Client = new Discord.Client()
const request = require("./request.js");
const { order } = require("./bybit.js");
let channel;
Client.login(config.token)
Client.on("ready", async () => {
  channel = await Client.channels.fetch("770845827995402251")
})


//create a server object:
http.createServer(function (req, res) {
  res.write('bh')
  res.end()
}).listen(8080)


async function main() {
  console.log(await request("/open-api/funding/prev-funding-rate", {symbol: "BTCUSD"}, false))
  let data = (await Bybit.getHistoricalData(200, config.interval, config.ticker)).result.map(period => +period.close)
  data = data.slice(0, data.length - 1)
  console.log(data.slice(150))
  const demaCross = new DEMA_CROSS(config.demaPeriods.slow, config.demaPeriods.fast, data)
  const api = require("./ws.js")
  api.on("data", async (close) => {
    const result = demaCross.update(close)
    if (result.change) {
      const closed = await Bybit.closePosition()
      if (closed) {
        let pnl = closed.exit - closed.entry
        pnl /= closed.exit
        pnl *= closed.qty
        pnl *= (closed.type === "Long" ? 1 : -1)
        pnl -= 0.0015 * closed.qty
        const closeEmbed = new Discord.MessageEmbed().setColor(pnl > 0 ? "#00ff00" : "#ff0000").setTimestamp().setTitle("Closed Position")
        .addFields(
          { name: 'Type', value: closed.type, inline: true },
          { name: 'P&L', value: "$" + pnl.toFixed(2), inline: true },
          { name: 'Quantity', value: closed.qty, inline: true },
          { name: 'Entry', value: closed.entry, inline: true },
          { name: 'Exit', value: closed.exit, inline: true }
        )
        channel.send(closeEmbed)
      }
      const opened = await Bybit.order(result.type)
      const openEmbed = new Discord.MessageEmbed().setColor("#7b00ff").setTimestamp().setTitle("Opened Position")
      .addFields(
        { name: 'Type', value: opened.type, inline: true },
        { name: 'Entry', value: opened.entry, inline: true },
        { name: 'Leverage', value: config.leverage + "x", inline: true },
        { name: 'DEMA Difference', value: "$" + result.diff.toFixed(2) }
      )
      channel.send(openEmbed)
    }
  })
}

main()