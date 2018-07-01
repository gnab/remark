export default class Dom {
  constructor() {
    this.intervalEvents = {};

    this.addIntervalEvent = this.addIntervalEvent.bind(this);
    this.removeIntervalEvent = this.removeIntervalEvent.bind(this);
  }

  static XMLHttpRequest() {
    return XMLHttpRequest;
  }

  static getHTMLElement() {
    return document.getElementsByTagName('html')[0];
  }

  static getBodyElement() {
    return document.body;
  }

  static getElementById(id) {
    return document.getElementById(id);
  }

  static getLocationHash() {
    return window.location.hash;
  }

  static setLocationHash(hash) {
    if (typeof window.history.replaceState === 'function' && document.origin !== 'null') {
      window.history.replaceState(undefined, undefined, hash);
    } else {
      window.location.hash = hash;
    }
  }

  addIntervalEvent(eventName, interval, callback) {
    this.removeIntervalEvent(eventName);
    this.intervalEvents[eventName] = setInterval(callback, interval);
  }

  removeIntervalEvent(eventName) {
    if (this.intervalEvents.hasOwnProperty(eventName)) {
      window.clearInterval(this.intervalEvents[eventName]);
    }
  }
}