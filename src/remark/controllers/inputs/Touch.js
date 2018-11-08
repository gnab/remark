export default class Touch {
  constructor(events, options) {
    this.events = events;
    this.options = options;

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.addTouchEventListeners = this.addTouchEventListeners.bind(this);
    this.removeTouchEventListeners = this.removeTouchEventListeners.bind(this);
  }

  activate() {
    this.addTouchEventListeners();
  }

  deactivate() {
    this.removeTouchEventListeners();
  }

  addTouchEventListeners() {
    let touch;
    let startX;
    let endX;

    if (this.options.touch === false) {
      return;
    }

    const isTap = () => {
      return Math.abs(startX - endX) < 10;
    };

    const handleTap = () => {
      this.events.emit('tap', endX);
    };

    const handleSwipe = () => {
      if (startX > endX) {
        this.events.emit('goToNextSlide');
      } else {
        this.events.emit('goToPreviousSlide');
      }
    };

    this.events.on('touchstart', (event) => {
      touch = event.touches[0];
      startX = touch.clientX;
    });

    this.events.on('touchend', (event) => {
      if (event.target.nodeName.toUpperCase() === 'A') {
        return;
      }

      touch = event.changedTouches[0];
      endX = touch.clientX;

      if (isTap()) {
        handleTap();
      } else {
        handleSwipe();
      }
    });

    this.events.on('touchmove', (event) => {
      event.preventDefault();
    });
  }

  removeTouchEventListeners() {
    this.events.removeAllListeners("touchstart");
    this.events.removeAllListeners("touchend");
    this.events.removeAllListeners("touchmove");
  }
}
