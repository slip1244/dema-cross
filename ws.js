// Files and modules

const config = require("./config.json")
const crypto = require("crypto")
const WebSocket = require("ws")
const net = config.testing ? "testnet" : "mainnet"
let last;

// Connect to sockets

const expires = Date.now() + 5000
const bybit = new WebSocket(`${config[net].dataApi}?api_key=${config[net].keys.key}&expires=${expires}&signature=${crypto.createHmac("sha256", config[net].keys.secret).update(`GET/realtime${expires}`).digest("hex")}`)

bybit.on("open", () => {
    emit("connect", "Bybit")
    bybit.orderBook = {}
    bybit.send(JSON.stringify({
        op: "subscribe",
        args: ["klineV2." + config.interval + "." + config.ticker]
    }))
})

bybit.on("close", () => {
    console.log("socket closed")
})

// Socket data

bybit.on("message", msg => {
    try {
        msg = JSON.parse(msg)
        if (msg.topic === "klineV2." + config.interval + "." + config.ticker) {
            if (msg.data[0].confirm) {
                if (last != msg.data[0].cross_seq) {
                    emit("data", msg.data[0].close)
                    last = msg.data[0].cross_seq
                }
            }
        } else if (msg.topic === "execution") {
            emit("execution", msg.data)
        }
    } catch {}
})


// Events

const events = {}

function on(event, handler) {
    if (events[event]) {
        events[event].push(handler)
    } else {
        events[event] = [handler]
    }
}

function emit(event, data) {
    if (events[event]) {
        for (const handler of events[event]) {
            handler(data)
        }
    }
}

// Exports

module.exports = {
    on: on
}