const { apiInstanceAction, apiSnapshotAction } = require('../utility/utility.js')
module.exports = class SnapshotStructure {
    constructor(rawSnapshotData, authInstance, instanceId) {
        if (!rawSnapshotData) return {}
        for (let key in rawSnapshotData) {
            this[key] = rawSnapshotData[key];
        }
        this.authInstance = authInstance
        this.instanceId = instanceId
    }
    async delete() {
        const snapshotAction = await apiSnapshotAction(this.authInstance.client.authKey, this.snapshotId, this.instanceId, 'delete')
        if (snapshotAction.statusCode) throw new Error(snapshotAction.message)
        return true
    }
    async rollback() {
        const snapshotAction = await apiSnapshotRollBack(this.authInstance.client.authKey, this.snapshotId, this.instanceId)
        if (snapshotAction.statusCode) throw new Error(snapshotAction.message)
        return true
    }
    async update(options = { name: 'untitled', description: 'none' }) {
        if (options.name.length > 254 || options.name.length < 1) throw new Error('"name" option size error, must be smaller than 254 and larger than 1')
        if (options.description.length > 254 || options.description.length < 1) throw new Error('"description" option is too large, must be smaller than 254 and larger than 1')
        const snapshotAction = await apiSnapshotAction(this.authInstance.client.authKey, this.snapshotId, this.instanceId, 'patch', options)
        if (snapshotAction.statusCode) throw new Error(snapshotAction.message)
        return snapshotAction.data[0]
    }
}