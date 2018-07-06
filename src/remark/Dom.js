let intervalEvents = {};

export default class Dom {
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

  static createElement(properties, childs) {
    const defaults = {
      elementType: 'div'
    };
    properties = properties || {};
    properties = {
      // jshint ignore:start
      ...defaults,
      ...properties
      // jshint ignore:end
    };

    let element = document.createElement(properties.elementType);

    for (let property in properties) {
      if (property !== 'elementType' && properties.hasOwnProperty(property)) {
        element[property] = properties[property];
      }
    }

    if (childs) {
      childs.forEach((child) => {
        element.appendChild(child);
      });
    }

    return element;
  }

  static addIntervalEvent(eventName, interval, callback) {
    Dom.removeIntervalEvent(eventName);
    intervalEvents[eventName] = setInterval(callback, interval);
  }

  static removeIntervalEvent(eventName) {
    if (intervalEvents.hasOwnProperty(eventName)) {
      window.clearInterval(intervalEvents[eventName]);
    }
  }
}