var jsdom = require('jsdom').jsdom;

document = jsdom('<html><head></head><body></body></html>');
window = document.createWindow();
alert = window.alert;

should.__proto__.calledWithExactly = function () {
  var args = Array.prototype.slice.call(arguments);

  this.assert(
    this.obj.calledWithExactly.apply(this.obj, args)
  , function () { return 'expected ' + this.inspect + ' to be called with ' + JSON.stringify(args); }
  , function () { return 'expected ' + this.inspect + ' not to be called with ' + JSON.stringify(args); })

  return this;
};
