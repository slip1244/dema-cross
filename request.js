// Files and modules

const config = require("./config.json")
const axios = require("axios")
const crypto = require("crypto")
const querystring = require('querystring');
const net = config.testing ? "testnet" : "mainnet"

// Methods

function request(endpoint, data, post=true) {
    return new Promise((resolve, reject) => {
        if (post) {
            // Authentication

            data.api_key = config[net].keys.key
            data.timestamp = Date.now()
            data.sign = crypto.createHmac("sha256", config[net].keys.secret).update(Object.keys(data).sort().map(key => `${key}=${data[key]}`).join("&")).digest("hex")

            // Post request

            axios({
                method: "POST",
                url: `${config[net].exchangeApi}${endpoint}`,
                headers: {
                    "content-type": "application/json"
                },
                data: JSON.stringify(data)
            }).then(result => {
                if (!result.data.result) {
                    reject(new Error(`${result.data.ret_code} ${result.data.ret_msg}`))
                } else {
                    resolve(result.data)
                }
            }).catch(reject)
        } else {
            // Authentication
            
            const apiKey = config[net].keys.key
            const timestamp = Date.now()
            const params = querystring.encode(data)
            let sign = `api_key=${apiKey}&timestamp=${timestamp}` + (params ? `&${params}` : "")
            sign = sign.split('&').sort().map(val => {
                let [k,v] = val.split('=');
                return [k, v.split(',').sort().join(',')].join('=');
            }).join('&');
            
            sign = crypto.createHmac("sha256", config[net].keys.secret).update(sign).digest("hex")
            // Get request

            
            axios({
                method: "GET",
                url: `${config[net].exchangeApi}${endpoint}?api_key=${apiKey}&timestamp=${timestamp}&sign=${sign}&${params}`
            }).then(result => {
                resolve(result.data)
            }).catch(reject)
        }
    })
}

// Exports

module.exports = request