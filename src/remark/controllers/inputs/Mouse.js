export default class Mouse {
  constructor(events, options) {
    this.events = events;
    this.options = options;

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.addMouseEventListeners = this.addMouseEventListeners.bind(this);
    this.removeMouseEventListeners = this.removeMouseEventListeners.bind(this);
  }

  activate() {
    this.addMouseEventListeners();
  }

  deactivate() {
    this.removeMouseEventListeners();
  }

  addMouseEventListeners() {
    if (this.options.click) {
      this.events.on('click', (event) => {
        if (event.target.nodeName !== 'A' && event.button === 0) {
          this.events.emit('gotoNextSlide');
        }
      });

      this.events.on('contextmenu', (event) => {
        if (event.target.nodeName === 'A') {
          // Don't interfere when right-clicking link
          return;
        }

        event.preventDefault();
        this.events.emit('gotoPreviousSlide');
      });
    }

    if (this.options.scroll !== false) {
      let scrollHandler = (event) => {
        if (event.wheelDeltaY > 0 || event.detail < 0) {
          this.events.emit('gotoPreviousSlide');
        } else if (event.wheelDeltaY < 0 || event.detail > 0) {
          this.events.emit('gotoNextSlide');
        }
      };

      // IE9, Chrome, Safari, Opera
      this.events.on('mousewheel', scrollHandler);
      // Firefox
      this.events.on('DOMMouseScroll', scrollHandler);
    }
  }

  removeMouseEventListeners() {
    this.events.removeAllListeners('click');
    this.events.removeAllListeners('contextmenu');
    this.events.removeAllListeners('mousewheel');
  }
}
