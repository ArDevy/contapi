
# contapi

An unnoficial api wrapper for the contabo api. Info on how to use is below

## Usage/Examples

###### Below is some examples for using this package

### Initiate
```javascript
const Contabo = require('contapi')
const client = new Contabo({
    apiUsername: 'email@email.com',
    apiPassword: 'exmple',
    clientId: '',
    clientSecret: '',
    autoReAuth: true //Set the client to automatically re auth every 285 seconds, or let you manually auth the client with .auth(). Keep in mind, contabo api authorization expires about every 290 seconds. It is reccomended to keep active
})

client.on('ready', () => {
    console.log('Instances cached, and client is authed!')
})
```

You can find all this information in the API Section of the [CCP](https://my.contabo.com/api/details)

### Using cache to get by instanceId and stop a instance
```javascript
const instance = client.instances.get('xxxxxxxx')
instance.stop()
```

### Using cache to get by name and stop a instance
```javascript
const instance = client.instances.find(instance => instance.name == 'vmiXXXXXXX')
instance.stop()
```

### Retrieving List of Instances then creating a snapshot
```javascript
const instances = await client.getInstances()

instances.forEach(async instance => {

    await instance.snapshot({
        name: 'mySnapshot',
        description: 'mySnapshotDescription'
     })
     .catch(e) {
         console.log(e)
         /*
         I have noticed that contabo's api sometimes breaks
         itself and says that you have max snapshots
         even if you dont, that is why I suggest a catch
         */
     }

})
```

Instances currently has 4 actions, start, restart, stop, and snapshot. They can be used to do as their name says, when you create a snapshot it will return with 3 actions they are delete, which is used to delete the snapshot, update, which can be used to update the name or title for the snapshot, and rollback, which allows you to rollback the instance to that snapshot

### Finding a specific server and restarting it by id
```javascript
const instance = await client.getInstance('xxxxxx')
instance.restart() 


```

When restarting the instance it will return the action back if you await it but it isn't required as the return value is quite useless

### Get an instances status by id
```javascript
const instanceStatus = await client.getInstanceStatus('xxxxxx')
console.log(instanceStatus)

```

Basically getInstance but it return the status on the function instead of the whole thing, should be useful for making it shorter

### Re Auth Client
```javascript
const clientAuth = await client.auth()
console.log(clientAuth)
```

This is automatically done as soon as you initiate the client, but if you want your auth key and other stuff I thought I would just throw this in there.
## Contributing

Contributions are always welcome!

See the [github](https://github.com/ArDevy/contabo) to begin contributing.

