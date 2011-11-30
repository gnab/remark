!function (context) {

  var remark = context.remark = context.remark || {}
    , dispatcher = remark.dispatcher = {}
    ;

  dispatcher.create = function () {
    mapKeys();
    mapTouches();
    mapWheel();

    return {

    };
  };

  var mapKeys = function () {
    window.onkeydown = function (event) {
      switch (event.keyCode) {
        case 33:
        case 37:
        case 38:
        case 75:
          remark.events.emit('previousSlide');
          break;
        case 32:
        case 34:
        case 39:
        case 40:
        case 74:
          remark.events.emit('nextSlide');
          break;
      }
    };
  };

  var mapTouches = function () {
    var width = window.innerWidth
      , touch
      , startX
      , endX
      ;

    var isTap = function () {
      return Math.abs(startX - endX) < 10;
    };

    var handleTap = function () {
      if (endX < width / 2) {
        remark.events.emit('previousSlide');
      }
      else {
        remark.events.emit('nextSlide');
      }
    };

    var handleSwipe = function () {
      if (startX > endX) {
        remark.events.emit('nextSlide');
      }
      else {
        remark.events.emit('previousSlide');
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
  };

  var mapWheel = function () {
    document.addEventListener('mousewheel', function (event) {
      if (event.wheelDeltaY > 0) {
        remark.events.emit('previousSlide');
      }
      else if (event.wheelDeltaY < 0) {
        remark.events.emit('nextSlide');
      };
    });
  };

}(this);
