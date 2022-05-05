module.exports = class CacheCollection extends Map {
    constructor() {
        super();
    }
    find(callback) {
        const mapIntoArray = Array.from(this, ([name, value]) => ({ ...value }))
        return mapIntoArray.find(callback)
    }
}