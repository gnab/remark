var EventEmitter = require('events').EventEmitter
  , events = require('./events')
  ;
  
module.exports = Dispatcher;

function Dispatcher () {
  mapHash();
  mapKeys();
  mapTouches();
  mapWheel();
}

function mapHash () {
  window.addEventListener('hashchange', navigate);
  navigate();

  function navigate () {
    var slideNoOrName = (window.location.hash || '').substr(1);

    gotoSlide(slideNoOrName);
  }
}

function mapKeys () {
  window.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
      case 33: // Page up
      case 37: // Left
      case 38: // Up
        gotoPreviousSlide();
        break;
      case 32: // Space
      case 34: // Page down
      case 39: // Right
      case 40: // Down
        gotoNextSlide();
        break;
      case 36: // Home
        gotoFirstSlide();
        break;
      case 35: // End
        gotoLastSlide();
        break;
      case 27: // Escape
        hideOverlay();
        break;
    }
  });
  window.addEventListener('keypress', function (event) {
    switch (String.fromCharCode(event.which)) {
      case 'j':
        gotoNextSlide();
        break;
      case 'k':
        gotoPreviousSlide();
        break;
      case '?':
        toggleHelp();
        break;
    }
  });
}

function mapTouches () {
  var touch
    , startX
    , endX
    ;

  var isTap = function () {
    return Math.abs(startX - endX) < 10;
  };

  var handleTap = function () {
    if (endX < window.innerWidth / 2) {
      gotoPreviousSlide();
    }
    else {
      gotoNextSlide();
    }
  };

  var handleSwipe = function () {
    if (startX > endX) {
      gotoNextSlide();
    }
    else {
      gotoPreviousSlide();
    }
  };

  document.addEventListener('touchstart', function (event) {
    touch = event.touches[0];
    startX = touch.clientX;
  });

  document.addEventListener('touchend', function (event) {
    if (event.target.nodeName.toUpperCase() === 'A') {
      return;
    }

    touch = event.changedTouches[0];
    endX = touch.clientX;

    if (isTap()) {
      handleTap();
    }
    else {
      handleSwipe();
    }
  });

  document.addEventListener('touchmove', function (event) {
    event.preventDefault();
  });
}

function mapWheel () {
  document.addEventListener('mousewheel', function (event) {
    if (event.wheelDeltaY > 0) {
      gotoPreviousSlide();
    }
    else if (event.wheelDeltaY < 0) {
      gotoNextSlide();
    }
  });
}

function gotoSlide (slideNoOrName) {
  events.emit('gotoSlide', slideNoOrName);
}

function gotoNextSlide () {
  events.emit('gotoNextSlide');
}

function gotoPreviousSlide () {
  events.emit('gotoPreviousSlide');
}

function gotoFirstSlide() {
  events.emit('gotoFirstSlide');
}

function gotoLastSlide() {
  events.emit('gotoLastSlide');
}

function toggleHelp () {
  events.emit('toggleHelp');
}

function hideOverlay () {
  events.emit('hideOverlay');
}
