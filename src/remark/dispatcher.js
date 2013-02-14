var EventEmitter = require('events').EventEmitter
  , dispatcher = module.exports = new EventEmitter()
  ;

dispatcher.initialize = function () {
  mapHash();
  mapKeys();
  mapTouches();
  mapWheel();
};

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
      case 75: // k
        gotoPreviousSlide();
        break;
      case 32: // Space
      case 34: // Page down
      case 39: // Right
      case 40: // Down
      case 74: // j
        gotoNextSlide();
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
  dispatcher.emit('gotoSlide', slideNoOrName);
}

function gotoNextSlide () {
  dispatcher.emit('gotoNextSlide');
}

function gotoPreviousSlide () {
  dispatcher.emit('gotoPreviousSlide');
}
