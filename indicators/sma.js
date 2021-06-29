// SMA indicator

class SMA {
    // Constructor

    constructor(period) {
        this.period = period
        this.prices = []
        this.value = null
    }

    // Methods

    update(value) {
        this.prices.push(value)
        if (this.prices.length > this.period) {
            this.prices.shift()
        }
        this.value = this.prices.reduce((a, b) => a + b) / this.period
    }

    getValue() {
        if (this.prices.length < this.period) {
            return null
        }
        return this.value
    }
}

// Exports

module.exports = SMA