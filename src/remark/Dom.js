export default class Dom {
  constructor() {
    this.XMLHttpRequest = XMLHttpRequest;
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
}

