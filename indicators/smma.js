// Files and modules

const SMA = require("./sma.js")

// SMMA indicator

class SMMA {
    // Constructor

    constructor(period) {
        this.period = period
        this.values = 0
        this.sma = new SMA(period)
        this.value = null
    }

    // Methods

    update(value) {
        this.values ++
        if (this.values < this.period) {
            this.sma.update(value)
        } else if (this.values === this.period) {
            this.sma.update(value)
            this.value = this.sma.getValue()
        } else {
            this.value = (this.value * (this.period - 1) + value) / this.period
        }
    }

    getValue() {
        return this.value
    }
}

// Exports

module.exports = SMMA