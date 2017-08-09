class Config {
    constructor() {

        this.options = this.defaults()
    }

    defaults() {
        return {
            resolution: { width: 480, height: 854 },
            sound: false
        }
    }
}

module.exports = new Config