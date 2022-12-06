const fetch = require('node-fetch')
const { v4: uuidv4 } = require('uuid');
const baseURL = "https://api.contabo.com/v1";

async function par(name) { throw new Error(`"${name}" is a required value`) }

async function apiInstance(instanceId = par('instanceId'), authKey = par('authKey')) {
    if(typeof authKey !== 'string' || typeof instanceId !== 'string') throw new Error('authKey, and the instanceId all much be strings')
    const response = await fetch(`${baseURL}/compute/instances/${instanceId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${authKey}`,
            'x-request-id': uuidv4(),
            'Content-Type': 'application/json'
        }
    });
    return response.json()
}

async function apiInstances(authKey = par('authKey')) {
    if(typeof authKey !== 'string') throw new Error('authKey must be a string')
    const response = await fetch(`${baseURL}/compute/instances`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${authKey}`,
            'x-request-id': uuidv4(),
            'Content-Type': 'application/json'
        }
    });
    return response.json()
}

async function apiInstanceAction(authKey = par('authKey'), instanceId = par('instanceId'), action = par('action')) {
    if(typeof authKey !== 'string' || typeof instanceId !== 'string' || typeof action !== 'string') throw new Error('authKey, instanceId, and action all much be strings')
    const response = await fetch(`${baseURL}/compute/instances/${instanceId}/actions/${action}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authKey}`,
            'x-request-id': uuidv4(),
            'Content-Type': 'application/json'
        }
    });
    return response.json()
}

async function apiInstanceSnapshot(authKey = par('authKey'), name = par('name'), description = 'none', instanceId = par('instanceId')) {
    if(typeof name !== 'string' || typeof description !== 'string') throw new Error('name, authKey, and or description provided must be a string')
    const response = await fetch(`${baseURL}/compute/instances/${instanceId}/snapshots`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authKey}`,
            'x-request-id': uuidv4(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            name: name,
            description: description
         })
    });
    return response.json()
}

async function apiInstanceSnapshots(authKey = par('authKey'), instanceId) {
    const response = await fetch(`${baseURL}/compute/instances/${instanceId}/snapshots`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${authKey}`,
            'x-request-id': uuidv4(),
            'Content-Type': 'application/json'
        },
    });
    return response.json()
}

async function apiSnapshotAction(authKey = par('authKey'), snapshotId = par('snapshotId'), instanceId = par('instanceId'), action = par('action'), options) {
    if(typeof authKey !== 'string' || typeof action !== 'string' || typeof snapshotId !== 'string') throw new Error('authkey, snapshotId and action provided must be a string')
    const response = await fetch(`${baseURL}/compute/instances/${instanceId}/snapshots/${snapshotId}`, {
        method: action.toUpperCase(),
        headers: {
            Authorization: `Bearer ${authKey}`,
            'x-request-id': uuidv4(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
    });
    return response.json()
}
module.exports = { apiInstance, apiInstanceAction, apiInstanceSnapshot, apiInstanceSnapshots, apiInstances, apiSnapshotAction }