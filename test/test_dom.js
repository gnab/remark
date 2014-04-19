module.exports = TestDom;

function TestDom () {
  this.html = document.createElement('html');
  this.body = document.createElement('body');
}

TestDom.prototype.XMLHttpRequest = FakeXMLHttpRequest;

function FakeXMLHttpRequest () {
  this._opened = false;
  this._sent = false;
};

FakeXMLHttpRequest.prototype.open = function () {
  this._opened = true;
};

FakeXMLHttpRequest.prototype.send = function () {
  this._sent = true;

  if (this._opened) {
    this.responseText = FakeXMLHttpRequest.responseText;
  }
};

TestDom.prototype.getHTMLElement = function () {
  return this.html;
};

TestDom.prototype.getBodyElement = function () {
  return this.body;
};

TestDom.prototype.getElementById = function () {}
TestDom.prototype.getLocationHash = function () {};
TestDom.prototype.setLocationHash = function (hash) {};
