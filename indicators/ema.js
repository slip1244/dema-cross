// EMA indicator

class EMA {
    // Constructor

    constructor(period) {
        this.values = 0
        this.period = period
        this._value = null
    }

    // Methods

    update(value) {
        this.values ++
        if (this._value === null) {
            this._value = value
        } else {
            const weight = 2 / (this.period + 1)
            this._value = value * weight + this._value * (1 - weight)
        }
    }

    get value() {
        if (this.values < this.period + 3) return null
        return this._value
    }
}

// Exports

module.exports = EMA