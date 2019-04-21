exports.register = function (events, options) {
  addMouseEventListeners(events, options);
};

exports.unregister = function (events) {
  removeMouseEventListeners(events);
};

function throttle(events, eventName) {
  var timestamp = null;
  return function() {
    var now = Date.now();
    if (timestamp === null || now - timestamp > 100) {
      events.emit(eventName);
    }
    timestamp = now;
  };
}

function addMouseEventListeners (events, options) {
  if (options.click) {
    events.on('click', function (event) {
      if (event.target.nodeName === 'A') {
        // Don't interfere when clicking link
        return;
      }
      else if (event.button === 0) {
        events.emit('gotoNextSlide');
      }
    });
    events.on('contextmenu', function (event) {
      if (event.target.nodeName === 'A') {
        // Don't interfere when right-clicking link
        return;
      }
      event.preventDefault();
      events.emit('gotoPreviousSlide');
    });
  }

  var throttledPrev = throttle(events, 'gotoPreviousSlide');
  var throttledNext = throttle(events, 'gotoNextSlide');
  if (options.scroll !== false) {
    var scrollHandler = function (event) {
      if (event.wheelDeltaY > 0 || event.detail < 0) {
        throttledPrev();
      }
      else if (event.wheelDeltaY < 0 || event.detail > 0) {
        throttledNext();
      }
    };

    // IE9, Chrome, Safari, Opera
    events.on('mousewheel', scrollHandler);
    // Firefox
    events.on('DOMMouseScroll', scrollHandler);
  }
}

function removeMouseEventListeners(events) {
  events.removeAllListeners('click');
  events.removeAllListeners('contextmenu');
  events.removeAllListeners('mousewheel');
}
