const request = require("./request.js")
const config = require("./config.json")

function getHistoricalData(limit, interval, symbol="BTCUSD", shift=0) {
  return request("/v2/public/kline/list", {
    symbol: symbol,
    interval: interval.toString(),
    from: ((Date.now() / 1000) - 5).toFixed() - (limit * (interval * 60)) + shift,
    limit: limit
  }, false)
}

function getPosition() {
  return request("/v2/private/position/list", {symbol: config.ticker}, false).then(resp => resp.result)
}

function getLastPrice() {
  return request("/v2/public/tickers", {symbol: config.ticker}, false).then(resp => resp.result[0].last_price)
}

async function order(side) {
  const lastPrice = await getLastPrice() 
  const position = await getPosition()
  console.log(lastPrice, position)
  const qty = Math.floor(position.wallet_balance * lastPrice) * config.leverage
  console.log(qty)
  const options = {
    side: side,
    symbol: config.ticker,
    order_type: "Market",
    qty: qty,
    stop_loss: Math.floor(lastPrice * (1 + ((1 / (1 / (config.stopLossPercent / config.leverage) + (side === "Buy" ? 1 : -1))) * (side === "Buy" ? -1 : 1)))),
    time_in_force: "GoodTillCancel"
  }
  const response = await request("/v2/private/order/create", options)
  return {type: (side === "Buy" ? "Long" : "Short"), entry: lastPrice, qty: qty}
}

async function closePosition() {
  const lastPrice = await getLastPrice() 
  const position = await getPosition()
  if (position.size === 0) return
  await request("/v2/private/order/create", {
      side: position.side === "Buy" ? "Sell" : "Buy",
      symbol: config.ticker,
      order_type: "Market",
      qty: position.size,
      time_in_force: "GoodTillCancel"
  })
  return {type: (position.side === "Buy" ? "Long" : "Short"), exit: lastPrice, entry: position.entry_price, qty: position.size}
}

module.exports = {
  getHistoricalData: getHistoricalData,
  getPosition: getPosition,
  getLastPrice: getLastPrice,
  closePosition: closePosition,
  order: order
}

// entry * (1 + ((1 / (1 / (SLdecimal / leverage) + (long ? 1 : -1))) * (long ? -1 : 1)))