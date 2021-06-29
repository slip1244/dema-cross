const Bybit = require("./bybit.js")
const fs = require("fs")
const DEMA = require("./dema-cross.js")
let bal = 1
const periods = [60]

async function test(period) {
  const data = require("./data/" + period + "m.json")
  data.splice(0,200)
  // data.splice(data.length - Math.floor(data.length * ((period - 1) / period)))
  const runs = [{
    bal: 0,
    fastPer: 0,
    slowPer: 0,
    trades: 0,
    winProp: 0,
    loseProp: 0,
  }]
  for (let fastPer = 1; fastPer <= 200; fastPer++) {
    for (let slowPer = 1; slowPer <= 200; slowPer++) {
      // if (fastPer >= slowPer) continue
      const dema = new DEMA(slowPer, fastPer, data.slice(0, slowPer + 10))
      let lastPosition
      let trades = 0
      let winningTrades = 0
      let losingTrades = 0
      for (const pt of data.slice(slowPer + 10)) {
        const result = dema.update(pt)
        if (result.change) {
          // console.log(result, pt)
          if (lastPosition) {
            let pnl = (pt - lastPosition.entry) / pt
            pnl *= lastPosition.qty
            pnl *= (lastPosition.type === "Buy" ? 1 : -1)
            pnl -= 0.0015 * lastPosition.qty
            pnl /= pt
            if (pnl < 0) losingTrades++
            else winningTrades++
            bal += pnl
          }
          lastPosition = {type: result.type, qty: bal * pt, entry: pt}
          trades++
        }
      }
      if (bal > runs[runs.length-1].bal) {
        runs.push({
            bal: bal,
            fastPer: fastPer,
            slowPer: slowPer,
            trades: trades,
            winProp: winningTrades/trades,
            loseProp: losingTrades/trades
        })
      }
      bal = 1
    }
  }
  console.log("Best Run For " + period + "m:")
  console.log(runs)
}


async function getData(period) {
  let data = []
  for (let i = 18; i >= 0; i--) {
    data = data.concat((await Bybit.getHistoricalData(200, period, config.ticker, -200 * period * i * 60)).result.map(period => +period.close))
    console.log(data.length)
  }
  console.log("got data")
  console.log(data.length)
  let last = data[0]
  let biggest = Math.abs(data[1]-data[0])
  for (const pt of data) {
    if (Math.abs(pt-last) > biggest) {
      biggest = Math.abs(pt-last)
    }
    last = pt
  }
  console.log(biggest)
  fs.writeFileSync("./data/" + period + "m.json", JSON.stringify(data.slice(data.length-1)))
}


test(240)

// for (const period of periods) {
//   test(period)
// }