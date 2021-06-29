// Files and modules

const EMA = require("./ema.js")

// DEMA indicator

class DEMA {
    // Constructor

    constructor(period) {
        this.period = period
        this.inner = new EMA(period)
        this.outer = new EMA(period)
    }

    // Methods

    update(value) {
        this.inner.update(value)
        this.outer.update(this.inner.value)
    }

    get value() {
        if (!this.inner.value || !this.outer.value) return null
        return 2 * this.inner.value - this.outer.value
    }
}

// Exports

module.exports = DEMA