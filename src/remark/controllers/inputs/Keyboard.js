export default class Keyboard {
  constructor(events) {
    this.events = events;
    this.gotoSlideNumber = '';
    
    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.addKeyboardEventListeners = this.addKeyboardEventListeners.bind(this);
    this.removeKeyboardEventListeners = this.removeKeyboardEventListeners.bind(this);

    this.activate();
  }

  activate() {
    this.gotoSlideNumber = '';
    this.addKeyboardEventListeners();
  }

  deactivate() {
    this.removeKeyboardEventListeners();
  }

  addKeyboardEventListeners() {
    this.events.on('keydown', (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        // Bail out if alt, meta or ctrl key was pressed
        return;
      }

      switch (event.keyCode) {
        case 33: // Page up
        case 37: // Left
        case 38: // Up
          this.events.emit('gotoPreviousSlide');
          break;
        case 32: // Space
          if(event.shiftKey){ // Shift+Space
            this.events.emit('gotoPreviousSlide');
          }else{
            this.events.emit('gotoNextSlide');
          }
          break;
        case 34: // Page down
        case 39: // Right
        case 40: // Down
          this.events.emit('gotoNextSlide');
          break;
        case 36: // Home
          this.events.emit('gotoFirstSlide');
          break;
        case 35: // End
          this.events.emit('gotoLastSlide');
          break;
        case 27: // Escape
          this.events.emit('hideOverlay');
          break;
        case 13: // Return
          if (self.gotoSlideNumber) {
            this.events.emit('gotoSlideNumber', self.gotoSlideNumber);
            self.gotoSlideNumber = '';
          }
          break;
      }
    });

    this.events.on('keypress', function (event) {
      if (event.metaKey || event.ctrlKey) {
        // Bail out if meta or ctrl key was pressed
        return;
      }

      let key = String.fromCharCode(event.which).toLowerCase();
      let tryToPreventDefault = true;

      switch (key) {
        case 'j':
          this.events.emit('gotoNextSlide');
          break;
        case 'k':
          this.events.emit('gotoPreviousSlide');
          break;
        case 'b':
          this.events.emit('toggleBlackout');
          break;
        case 'm':
          this.events.emit('toggleMirrored');
          break;
        case 'c':
          this.events.emit('createClone');
          break;
        case 'p':
          this.events.emit('togglePresenterMode');
          break;
        case 'f':
          this.events.emit('toggleFullscreen');
          break;
        case 't':
          this.events.emit('resetTimer');
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
          self.gotoSlideNumber += key;
          break;
        case 'h':
        case '?':
          this.events.emit('toggleHelp');
          break;
        default:
          tryToPreventDefault = false;
      }

      if (tryToPreventDefault && event && event.preventDefault)
        event.preventDefault();

    });
  }

  removeKeyboardEventListeners() {
    this.events.removeAllListeners("keydown");
    this.events.removeAllListeners("keypress");
  }
}
