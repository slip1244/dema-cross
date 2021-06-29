const DEMA = require('./indicators/dema.js')

class DEMA_CROSS {
  constructor(slowPeriod, fastPeriod, initData) {
    this.slowPeriod = slowPeriod
    this.fastPeriod = fastPeriod
    this.slowDEMA = new DEMA(slowPeriod)
    this.fastDEMA = new DEMA(fastPeriod)
    for (const close of initData) {
      this.slowDEMA.update(close);
      this.fastDEMA.update(close);
    }
    const diff = this.fastDEMA.value - this.slowDEMA.value
    this.position = Math.abs(diff) == diff
    this.lastPosition = this.position
    console.log(this.slowDEMA.value, this.fastDEMA.value)
  }

  update(value) {
    this.slowDEMA.update(value)
    this.fastDEMA.update(value)
    console.log(this.slowDEMA.value, this.fastDEMA.value)
    this.lastPosition = this.position
    const diff = this.fastDEMA.value - this.slowDEMA.value
    this.position = Math.abs(diff) == diff
    return {change: this.lastPosition !== this.position, type: this.position ? "Buy" : "Sell", diff: Math.abs(diff)}
  }
}

module.exports = DEMA_CROSS