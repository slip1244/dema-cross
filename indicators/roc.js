// ROC indicator

class ROC {
    // Constructor

    constructor(period) {
        this.period = period + 1
        this.prices = []
    }

    // Class methods

    static squash(value) {
        // Sigmoid squash

        return 100 / (1 + Math.E ** (-250 * value))
    }

    // Methods

    update(value) {
        this.prices.push(value)
        if (this.prices.length > this.period) {
            this.prices.shift()
        }
    }

    getValue() {
        if (this.prices.length === this.period) {
            return (this.prices[this.period - 1] - this.prices[0]) / this.prices[0]
        }
        return null
    }
}

// Exports

module.exports = ROC