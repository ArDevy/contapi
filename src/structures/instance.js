const { apiInstance, apiInstanceAction, apiInstanceSnapshot, apiInstanceSnapshots } = require('../utility/utility.js')
const SnapshotStructure = require('./snapshot.js')
const CacheCollection = require('./structures/cacheCollection.js')
module.exports = class InstanceStructure {
    constructor(rawInstanceData, authClient) {
        if(!rawInstanceData) return {}
        for (let key in rawInstanceData) {
            this[key] = rawInstanceData[key];
        }
        this.snapshots = null;
        this.client = authClient
        this.initSnapshots.bind(this)()
    }
    async initSnapshots() {
        const instanceSnapshots = await apiInstanceSnapshots(this.client.authKey, this.instanceId)
        if(instanceSnapshots.statusCode) throw new Error(instanceSnapshots.message)
        this.snapshots = instanceSnapshots.data.map(i => {
            return new SnapshotStructure(i, this, this.instanceId)
        })
    }
    async stop() {
        const instanceAction = await apiInstanceAction(this.client.authKey, this.instanceId, 'stop')
        if(instanceAction.statusCode) throw new Error(instanceAction.message)
        return instanceAction.data[0]
    }
    async start() {
        const instanceAction = await apiInstanceAction(this.client.authKey, this.instanceId, 'start')
        if(instanceAction.statusCode) throw new Error(instanceAction.message)
        return instanceAction.data[0]
    }
    async restart() {
        const instanceAction = await apiInstanceAction(this.client.authKey, this.instanceId, 'restart')
        if(instanceAction.statusCode) throw new Error(instanceAction.message)
        return instanceAction.data[0]
    }
    async snapshot({ name, description }) {
        const instanceAction = await apiInstanceSnapshot(this.client.authKey, name, description, this.instanceId)
        if(instanceAction.statusCode) throw new Error(instanceAction.message)
        const snapshot = new SnapshotStructure(instanceAction.data[0], this, this.instanceId)
        return snapshot
    }
}