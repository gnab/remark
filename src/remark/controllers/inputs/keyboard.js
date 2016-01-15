module.exports = Keyboard;

function Keyboard(events) {
  this._events = events;
  
  this.activate();
}

Keyboard.prototype.activate = function () {
  this._gotoSlideNumber = '';
  
  this.addKeyboardEventListeners();
};

Keyboard.prototype.deactivate = function () {
  this.removeKeyboardEventListeners();
};

Keyboard.prototype.addKeyboardEventListeners = function () {
  var self = this;
  var events = this._events;
  
  events.on('keydown', function (event) {
    if (event.metaKey || event.ctrlKey) {
      // Bail out if meta or ctrl key was pressed
      return;
    }

    switch (event.keyCode) {
      case 33: // Page up
      case 37: // Left
      case 38: // Up
        events.emit('gotoPreviousSlide');
        break;
      case 32: // Space
      case 34: // Page down
      case 39: // Right
      case 40: // Down
        events.emit('gotoNextSlide');
        break;
      case 36: // Home
        events.emit('gotoFirstSlide');
        break;
      case 35: // End
        events.emit('gotoLastSlide');
        break;
      case 27: // Escape
        events.emit('hideOverlay');
        break;
      case 13: // Return
        if (self._gotoSlideNumber) {
          events.emit('gotoSlide', self._gotoSlideNumber);
          self._gotoSlideNumber = '';
        }
        break;
    }
  });

  events.on('keypress', function (event) {
    if (event.metaKey || event.ctrlKey) {
      // Bail out if meta or ctrl key was pressed
      return;
    }
    
    var key = String.fromCharCode(event.which).toLowerCase();

    switch (key) {
      case 'j':
        events.emit('gotoNextSlide');
        break;
      case 'k':
        events.emit('gotoPreviousSlide');
        break;
      case 'b':
        events.emit('toggleBlackout');
        break;
      case 'm':
        events.emit('toggleMirrored');
        break;
      case 'c':
        events.emit('createClone');
        break;
      case 'p':
        events.emit('togglePresenterMode');
        break;
      case 'f':
        events.emit('toggleFullscreen');
        break;
      case 't':
        events.emit('resetTimer');
        break;
      case '1': 
      case '2': 
      case '3': 
      case '4': 
      case '5':
      case '6': 
      case '7': 
      case '8': 
      case '9': 
      case '0':
        self._gotoSlideNumber += key;
        break;
      case 'h':
      case '?':
        events.emit('toggleHelp');
        break;
    }
  });
};

Keyboard.prototype.removeKeyboardEventListeners = function () {
  var events = this._events;
  
  events.removeAllListeners("keydown");
  events.removeAllListeners("keypress");
};