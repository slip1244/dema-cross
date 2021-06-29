// Files and modules

const SMMA = require("./smma.js")

// RSI indicator

class RSI {
    // Constructor

    constructor(period) {
        this.period = period
        this.prices = []
        this.avgUp = new SMMA(period)
        this.avgDown = new SMMA(period)
    }

    // Class methods

    static squash(value) {
        // No squash
        
        return value
    }

    // Methods

    update(value) {
        if (this.prices.length) {
            const move = value - this.prices[this.prices.length - 1]
            this.avgUp.update(move > 0 ? move : 0)
            this.avgDown.update(move < 0 ? Math.abs(move) : 0)
        }

        this.prices.push(value)
        if (this.prices.length > this.period + 1) {
            this.prices.shift()
        }
    }

    getValue() {
        if (this.prices.length <= this.period) {
            return null
        }

        const up = this.avgUp.getValue()
        const down = this.avgDown.getValue()

        const rs = down === 0 ? 100 : up / down
        return 100 - 100 / (rs + 1)
    }
}

// Exports

module.exports = RSI