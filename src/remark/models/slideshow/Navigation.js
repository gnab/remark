export default (superClass) => class extends superClass {
  constructor(events) {
    super();
    this.events = events;
    this.currentSlideIndex = -1;
    this.started = null;

    this.registerEvents = this.registerEvents.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.getCurrentSlideIndex = this.getCurrentSlideIndex.bind(this);
    this.gotoSlideByIndex = this.gotoSlideByIndex.bind(this);
    this.gotoSlide = this.gotoSlide.bind(this);

    this.gotoSlideNumber = this.gotoSlideNumber.bind(this);
    this.gotoPreviousSlide = this.gotoPreviousSlide.bind(this);
    this.gotoNextSlide = this.gotoNextSlide.bind(this);
    this.gotoFirstSlide = this.gotoFirstSlide.bind(this);
    this.gotoLastSlide = this.gotoLastSlide.bind(this);
    this.getSlideIndex = this.getSlideIndex.bind(this);

    this.registerEvents();
  }

  registerEvents() {
    this.events.on('gotoSlide', this.gotoSlide);
    this.events.on('gotoSlideNumber', this.gotoSlideNumber);
    this.events.on('gotoPreviousSlide', this.gotoPreviousSlide);
    this.events.on('gotoNextSlide', this.gotoNextSlide);
    this.events.on('gotoFirstSlide', this.gotoFirstSlide);
    this.events.on('gotoLastSlide', this.gotoLastSlide);

    this.events.on('slidesChanged', () => {
      if (this.currentSlideIndex > this.getSlideCount()) {
        this.currentSlideIndex = this.getSlideCount();
      }
    });

    this.events.on('createClone', () => {
      if (!this.clone || this.clone.closed) {
        this.clone = window.open(location.href, this.getOptions().cloneTarget, 'location=no');
      } else {
        this.clone.focus();
      }
    });

    this.events.on('resetTimer', () => {
      this.started = false;
    });
  }

  pause() {
    this.events.emit('pause');
  }

  resume() {
    this.events.emit('resume');
  }

  getCurrentSlideIndex () {
    return this.currentSlideIndex;
  }

  gotoSlideByIndex(slideIndex, noMessage) {
    let alreadyOnSlide = slideIndex === this.currentSlideIndex;
    let slideOutOfRange = slideIndex < 0 || slideIndex > this.getSlideCount() - 1;

    if (noMessage === undefined) {
      noMessage = false;
    }

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (this.currentSlideIndex !== -1) {
      this.events.emit('hideSlide', this.currentSlideIndex, false);
    }

    // Use some tri-state logic here.
    // null = We haven't shown the first slide yet.
    // false = We've shown the initial slide, but we haven't progressed beyond that.
    // true = We've issued the first slide change command.
    if (this.started === null) {
      this.started = false;
    } else if (this.started === false) {
      // We've shown the initial slide previously - that means this is a
      // genuine move to a new slide.
      this.events.emit('start');
      this.started = true;
    }

    this.events.emit('showSlide', slideIndex);
    this.currentSlideIndex = slideIndex;
    this.events.emit('slideChanged', slideIndex + 1);

    if (!noMessage) {
      if (this.clone && !this.clone.closed) {
        this.clone.postMessage('gotoSlide:' + (this.currentSlideIndex + 1), '*');
      }

      if (window.opener) {
        window.opener.postMessage('gotoSlide:' + (this.currentSlideIndex + 1), '*');
      }
    }
  }

  gotoSlide(slideNoOrName, noMessage) {
    let slideIndex = this.getSlideIndex(slideNoOrName);
    this.gotoSlideByIndex(slideIndex, noMessage);
  }

  gotoSlideNumber(slideNumber, noMessage) {
    let slides = this.getSlidesByNumber(parseInt(slideNumber, 10));

    if (slides && slides.length) {
      this.gotoSlideByIndex(slides[0].getSlideIndex(), noMessage);
    }
  }

  gotoPreviousSlide() {
    this.gotoSlideByIndex(this.currentSlideIndex - 1);
  }

  gotoNextSlide() {
    this.gotoSlideByIndex(this.currentSlideIndex + 1);
  }

  gotoFirstSlide() {
    this.gotoSlideByIndex(0);
  }

  gotoLastSlide() {
    this.gotoSlideByIndex(this.getSlideCount() - 1);
  }

  getSlideIndex(slideNoOrName) {
    if (typeof slideNoOrName === 'number') {
      return slideNoOrName - 1;
    }

    let slideNo = parseInt(slideNoOrName, 10);

    if (slideNo.toString() === slideNoOrName) {
      return slideNo - 1;
    }

    if (slideNoOrName.match(/^p\d+$/)){
      this.events.emit('forcePresenterMode');
      return parseInt(slideNoOrName.substr(1), 10)-1;
    }

    let slide = this.getSlideByName(slideNoOrName);

    if (slide) {
      return slide.getSlideIndex();
    }

    return 0;
  }
}
