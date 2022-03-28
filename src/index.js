const fetch = require('node-fetch')
const { v4 } = require('uuid');
const uuidv4 = v4;
const { apiInstance, apiInstances } = require('./utility/utility.js')
const { InstanceStructure } = require('./structures/instance.js')
const utf8 = require('utf8');
module.exports = class ContaboAPI {
    constructor({ clientId, clientSecret, apiUsername, apiPassword }) {
        if (!clientId || !clientSecret || !apiUsername || !apiPassword) throw new Error(`Please provide a clientId, clientSecret, apiUsername, and a apiPassword.`)
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.apiUsername = encodeURIComponent(apiUsername)
        this.apiPassword = encodeURIComponent(apiPassword)
        this.authKey = null
        this.auth.bind(this)()
        setInterval(this.auth.bind(this), 280000)
    }
    async auth() {
        const response = await fetch(`https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'x-request-id': uuidv4(),
                'Content-type': 'application/x-www-form-urlencoded'
            },
            body: `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=password&username=${this.apiUsername}&password=${this.apiPassword}`
        });
        const r = await response.json()
        if(r.statusCode) throw new Error(r.message)
        this.authKey = r.access_token
        return r
    }
    async getInstance(instanceId) {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instance = await apiInstance(instanceId, this.authKey)
        if (instance.statusCode) return console.error(instance)
        const structure = new InstanceStructure(instance.data[0], this.authKey)
        return structure
    }
    async getInstances() {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instances = await apiInstances(this.authKey)
        if (instances.statusCode) return console.error(instance)
        return instances.data.map(i => {
            return new InstanceStructure(i, this.authKey)
        })

        
    }
    async getInstanceStatus(instanceId) {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instance = await apiInstance(instanceId, this.authKey)
        if (instance.statusCode) return console.error(d)
        return instance.data[0].status
    }
}