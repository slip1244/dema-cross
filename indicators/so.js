// SO indicator

class SO {
    // Constructor

    constructor(period) {
        this.period = period
        this.prices = []
    }

    // Class methods

    static squash(value) {
        // No squash

        return value
    }

    // Methods

    update(value) {
        this.prices.push(value)
        if (this.prices.length > this.period) {
            this.prices.shift()
        }
    }

    getValue() {
        const max = Math.max(...this.prices)
        const min = Math.min(...this.prices)
        return ((this.prices[this.prices.length - 1] - min) / (max - min)) * 100
    }
}

// Exports

module.exports = SO