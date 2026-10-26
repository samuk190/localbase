export default class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(eventName, listener) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set())
    }
    this.events.get(eventName).add(listener)

    // Unsubscribe helper
    return () => {
      this.off(eventName, listener)
    }
  }

  off(eventName, listener) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).delete(listener)
      if (this.events.get(eventName).size === 0) {
        this.events.delete(eventName)
      }
    }
  }

  emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      for (const listener of this.events.get(eventName)) {
        try {
          listener(...args)
        } catch (err) {
          console.error(`Error in event listener for "${eventName}":`, err)
        }
      }
    }
  }

  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName)
    } else {
      this.events.clear()
    }
  }
}
