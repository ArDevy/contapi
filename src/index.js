const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { EventEmitter } = require('node:events');
const { apiInstance, apiInstances } = require('./utility/utility.js');
const CacheCollection = require('./structures/cacheCollection.js');
const InstanceStructure = require('./structures/instance.js');

module.exports = class ContaboAPI extends EventEmitter {
    constructor({ clientId, clientSecret, apiUsername, apiPassword, autoReAuth = true }) {
        super();
        if (!clientId || !clientSecret || !apiUsername || !apiPassword) throw new Error(`Please provide a clientId, clientSecret, apiUsername, and a apiPassword.`)
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.apiUsername = encodeURIComponent(apiUsername)
        this.apiPassword = encodeURIComponent(apiPassword)
        this.instances = new CacheCollection();
        this.authKey = null
        this.authed = false;
        this.instancesCached = false;
        this.autoReAuth = autoReAuth; // default is true to keep it backward compatible
        if(this.autoReAuth) {
            this.auth.bind(this)()
            this.cacheInstances.bind(this)()
            this.once('instancesCached', () => { this.instancesCached = true; if(this.authed && this.instancesCached) this.emit('ready', this) })
            this.once('clientAuthed', () => { this.authed = true; if(this.authed && this.instancesCached) this.emit('ready', this) })
            setInterval(this.auth.bind(this), 285000)
            setInterval(this.cacheInstances.bind(this), 280000)
        }
    }

    async cacheInstances() {
        if(!this.authKey) {
            if(!this.autoReAuth) {
                throw new Error('No auth key found, please use the auth method!')
            }
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
        if(response.status < 200 || response.status > 299) {
            const errMessage = `Failed to auth with Contabo API. HTTP Status Code: ${response.status} - ${response.statusText}`
            this.emit('error', new Error(errMessage))
            throw new Error(errMessage)
        }
        const r = await response.json()
        if(r.statusCode) {
            const errMessage = `Failed to auth with Contabo API. API Status Code: ${r.statusCode} - ${r.message}`
            this.emit('error', new Error(errMessage))
            throw new Error(r.message)
        }
        this.authKey = r.access_token
        this.emit('clientAuthed')
        return r
    }
    async getInstance(instanceId) {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instance = await apiInstance(instanceId, this.authKey)
        if (instance.statusCode) throw new Error(`${instance.statusCode} - ${instance.message}`)
        const structure = new InstanceStructure(instance.data[0], this)
        return structure
    }
    async getInstances() {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instances = await apiInstances(this.authKey)
        if (instances.statusCode) throw new Error(`${instances.statusCode} - ${instances.message}`)
        return instances.data.map(i => {
            return new InstanceStructure(i, this)
        })
    }
    async getInstanceStatus(instanceId) {
        if (!this.authKey) throw new Error('No auth key found, please use the auth method!')
        const instance = await apiInstance(instanceId, this.authKey)
        if (instance.statusCode) throw new Error(`${instance.statusCode} - ${instance.message}`)
        return instance.data[0].status
    }
}