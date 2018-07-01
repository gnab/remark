class FakeXMLHttpRequest {
  constructor() {
    this.opened = false;
    this.sended = false;

    this.open = this.open.bind(this);
    this.send = this.send.bind(this);
  }

  open() {
    this.opened = true;
  }

  send() {
    this.sended = true;

    if (this.opened) {
      this.responseText = FakeXMLHttpRequest.responseText;
    }
  }
}

let html;
let body;
let httpRequest = new FakeXMLHttpRequest();

export default class TestDom {
  constructor() {
    html = document.createElement('html');
    body = document.createElement('body');
    httpRequest = new FakeXMLHttpRequest();
  }

  static XMLHttpRequest() {
    return httpRequest;
  }

  static getHTMLElement() {
    return html;
  }

  static getBodyElement() {
    return body;
  }

  static getElementById() {

  }

  static getLocationHash() {

  }

  static setLocationHash(hash) {

  }

  addIntervalEvent() {

  }
}
