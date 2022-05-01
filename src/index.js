const fetch = require('node-fetch')
const { v4 } = require('uuid');
const uuidv4 = v4;
const { EventEmitter } = require('events');
const { apiInstance, apiInstances, apiInstanceSnapshot } = require('./utility/utility.js')
const InstanceStructure = require('./structures/instance.js')
const utf8 = require('utf8');
module.exports = class ContaboAPI extends EventEmitter {
    constructor({ clientId, clientSecret, apiUsername, apiPassword }) {
        super();
        if (!clientId || !clientSecret || !apiUsername || !apiPassword) throw new Error(`Please provide a clientId, clientSecret, apiUsername, and a apiPassword.`)
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.apiUsername = encodeURIComponent(apiUsername)
        this.apiPassword = encodeURIComponent(apiPassword)
        this.instances = new Map();
        this.authKey = null
        this.authed = false;
        this.instancesCached = false;
        this.auth.bind(this)()
        this.cacheInstances.bind(this)()
        this.on('instancesCached', () => { this.instancesCached = true; if(this.authed && this.instancesCached) this.emit('ready', this) })
        this.on('clientAuthed', () => { this.authed = true; if(this.authed && this.instancesCached) this.emit('ready', this) })
        setInterval(this.auth.bind(this), 285000)
        setInterval(this.cacheInstances.bind(this), 280000)
    }

    async cacheInstances() {
        if(!this.authKey) {
            //No AuthKey, try again in 3000ms (3s)
            setTimeout(() => {
                this.cacheInstances.bind(this)()
            }, 3000);
            return
        }
        const instances = await this.getInstances.bind(this)()
        instances.map(instance => this.instances.set(instance.instanceId, instance))
        this.emit('instancesCached', this.instances);
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
        this.emit('clientAuthed')
        return r
    }
    async getInstance(instanceId) {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instance = await apiInstance(instanceId, this.authKey)
        if (instance.statusCode) throw new Error(`${instance.statusCode} - ${instance.message}`)
        const structure = new InstanceStructure(instance.data[0], this.authKey)
        return structure
    }
    async getInstances() {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instances = await apiInstances(this.authKey)
        if (instances.statusCode) throw new Error(`${instances.statusCode} - ${instances.message}`)
        return instances.data.map(i => {
            return new InstanceStructure(i, this.authKey)
        })
    }
    async getInstanceStatus(instanceId) {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instance = await apiInstance(instanceId, this.authKey)
        if (instance.statusCode) throw new Error(`${instance.statusCode} - ${instance.message}`)
        return instance.data[0].status
    }
}