class EventEmitter {
  constructor() {
    this._events = {};
    this._eventsCount = 0;
    this._maxListeners = undefined;
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    if (this._maxListeners === undefined) {
      return EventEmitter.defaultMaxListeners;
    }
    return this._maxListeners;
  }

  emit(type, ...args) {
    if (!this._events[type]) return false;
    
    const handlers = this._events[type];
    if (Array.isArray(handlers)) {
      handlers.forEach((handler) => handler.apply(this, args));
    } else {
      handlers.apply(this, args);
    }
    
    return true;
  }

  addListener(type, listener) {
    return this.on(type, listener);
  }

  on(type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('The listener must be a function');
    }
    
    if (!this._events[type]) {
      this._events[type] = [];
    }
    
    this._events[type].push(listener);
    this._eventsCount++;
    
    return this;
  }

  removeListener(type, listener) {
    if (!this._events[type]) return this;
    
    const list = this._events[type];
    if (Array.isArray(list)) {
      const index = list.indexOf(listener);
      if (index !== -1) {
        list.splice(index, 1);
        this._eventsCount--;
      }
    }
    
    return this;
  }
}

// Set the default max listeners
EventEmitter.defaultMaxListeners = 10;

// Create the setMaxListeners function that libp2p is looking for
export function setMaxListeners(n, eventTarget) {
  if (eventTarget === undefined) {
    return undefined;
  }
  if (typeof eventTarget.setMaxListeners === 'function') {
    eventTarget.setMaxListeners(n);
  }
  return eventTarget;
}

export { EventEmitter };