var resources = require('../resources');

module.exports = OverlayView;

function OverlayView (events) {
  var self = this;

  self.element = document.createElement('div');

  self.element.className = 'overlay';
  self.element.innerHTML = resources.overlay;

  events.on('hideOverlay', function () {
    self.hide();
  });

  events.on('toggleHelp', function () {
    self.show();
  });
}

OverlayView.prototype.show = function () {
  this.element.style.display = 'block';
};

OverlayView.prototype.hide = function () {
  this.element.style.display = 'none';
};
