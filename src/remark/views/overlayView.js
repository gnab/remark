var events = require('../events')
  , resources = require('../resources')
  ;

module.exports = OverlayView;

function OverlayView (element) {
  var self = this;

  self.element = document.createElement('div');
  self.element.className = 'overlay light-keys';
  self.element.innerHTML = resources.overlay;

  element.appendChild(self.element);

  events.on('hideOverlay', function () {
    hide(self.element);
  });

  events.on('toggleHelp', function () {
    show(self.element);
  });
}

function show (element) {
  element.style.display = 'block';
}

function hide (element) {
  element.style.display = 'none';
}
