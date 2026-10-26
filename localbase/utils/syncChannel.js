export default class SyncChannel {
  constructor(dbName, eventEmitter) {
    this.dbName = dbName
    this.emitter = eventEmitter
    this.channel = null

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(`localbase_sync_${dbName}`)
        this.channel.onmessage = (event) => {
          const payload = event.data
          if (payload && payload.db === this.dbName) {
            this.emitter.emit(payload.event, payload.data, true /* fromRemote */)
          }
        }
      } catch (e) {
        // BroadcastChannel unavailable
      }
    }
  }

  broadcast(eventName, data) {
    // 1. Emit locally
    this.emitter.emit(eventName, data, false /* fromRemote */)

    // 2. Broadcast across tabs/windows
    if (this.channel) {
      try {
        this.channel.postMessage({
          db: this.dbName,
          event: eventName,
          data: data,
          timestamp: Date.now()
        })
      } catch (e) {
        // Ignore serialization failure
      }
    }
  }

  close() {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
  }
}
