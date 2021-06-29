// Files and modules

const DEMA = require("./dema.js")

// MACD indicator

class MACD {
    // Constructor

    constructor(long, short, signal) {
        this.longPeriod = long
        this.shortPeriod = short
        this.signalPeriod = signal
        this.values = 0
        this.long = new DEMA(long)
        this.short = new DEMA(short)
        this.signal = new DEMA(signal)
    }

    // Class methods

    static squash(value) {
        // Sigmoid squash

        return 100 / (1 + Math.E ** (-0.3 * value))
    }

    // Methods

    update(value) {
        this.values ++
        this.long.update(value)
        this.short.update(value)
        this.signal.update(this.short.getValue() - this.long.getValue())
    }

    getValue() {
        if (this.values < this.long || this.values < this.short || this.values < this.signal) {
            return null
        }
        return this.short.getValue() - this.long.getValue() - this.signal.getValue()
    }
}

// Exports

module.exports = MACD