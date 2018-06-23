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

export default class TestDom {
  constructor() {
    this.html = document.createElement('html');
    this.body = document.createElement('body');
    this.httpRequest = new FakeXMLHttpRequest();

    this.XMLHttpRequest = this.XMLHttpRequest.bind(this);
    this.getHTMLElement = this.getHTMLElement.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);
  }

  XMLHttpRequest() {
    return this.httpRequest;
  }

  getHTMLElement() {
    return this.html;
  }

  getBodyElement() {
    return this.body;
  }

  getElementById() {

  }

  getLocationHash() {

  }

  setLocationHash(hash) {

  }
}
