var EventEmitter = require('events').EventEmitter
  , dom = module.exports = new EventEmitter()
  ;

dom.window = proxyObject('window');
dom.document = proxyObject('document');

dom.exports = dom.window;

proxyFunction(dom.window, 'alert');
proxyFunction(dom.document, 'createElement');
proxyFunction(dom.document, 'getElementById');
proxyFunction(dom.document, 'getElementsByTagName');

proxyEvent(dom.window, 'load');
proxyEvent(dom.window, 'resize');
proxyEvent(dom.window, 'keydown');
proxyEvent(dom.window, 'hashchange');
proxyEvent(dom.document, 'touchstart');
proxyEvent(dom.document, 'touchend');
proxyEvent(dom.document, 'touchmove');
proxyEvent(dom.document, 'mousewheel');

dom.on('load', updateDimensions);
dom.on('resize', updateDimensions);

function proxyObject (object) {
  if (typeof this[object] !== 'undefined') {
    object = this[object];
  }
  else {
    object = new EventEmitter();
    object.addEventListener = object.on;
  }

  return object;
}

function proxyFunction (element, func) {
  if (typeof element[func] === 'function') {
    dom[func] = function () { return element[func].apply(element, arguments); };
  }
  else {
    dom[func] = function () { return {}; };
  }
}

function proxyEvent (element, eventName) {
  element.addEventListener(eventName, function (event) {
    dom.emit(eventName, event);
  });
}

function updateDimensions () {
  dom.innerHeight = dom.window.innerHeight;
  dom.innerWidth = dom.window.innerWidth;
}
