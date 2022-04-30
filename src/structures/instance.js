const { apiInstance, apiInstanceAction, apiInstanceSnapshot, apiInstanceSnapshots } = require('../utility/utility.js')
const SnapshotStructure = require('./snapshot.js')
module.exports = class InstanceStructure {
    constructor(rawInstanceData, authKey) {
        if(!rawInstanceData) return {}
        for (let key in rawInstanceData) {
            this[key] = rawInstanceData[key];
        }
        this.snapshots = null
        this.authKey = authKey
        this.initSnapshots.bind(this)()
    }
    async initSnapshots() {
        const instanceSnapshots = await apiInstanceSnapshots(this.authKey, this.instanceId)
        if(instanceSnapshots.statusCode) throw new Error(instanceSnapshots.message)
        this.snapshots = instanceSnapshots.data.map(i => {
            return new SnapshotStructure(i, this.authKey)
        })
    }
    async stop() {
        const instanceAction = await apiInstanceAction(this.authKey, this.instanceId, 'stop')
        if(instanceAction.statusCode) throw new Error(instanceAction.message)
        return instanceAction.data[0]
    }
    async start() {
        const instanceAction = await apiInstanceAction(this.authKey, this.instanceId, 'start')
        if(instanceAction.statusCode) throw new Error(instanceAction.message)
        return instanceAction.data[0]
    }
    async restart() {
        const instanceAction = await apiInstanceAction(this.authKey, this.instanceId, 'restart')
        if(instanceAction.statusCode) throw new Error(instanceAction.message)
        return instanceAction.data[0]
    }
    async snapshot({ name, description }) {
        const instanceAction = await apiInstanceSnapshot(this.authKey, name, description, this.instanceId)
        if(instanceAction.statusCode) throw new Error(instanceAction.message)
        const snapshot = new SnapshotStructure(instanceAction.data[0], this.authKey, this.instanceId)
        return snapshot
    }
}