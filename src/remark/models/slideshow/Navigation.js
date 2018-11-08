export default (superClass) => class extends superClass {
  constructor(events, options, callback) {
    super(events, options, callback);
    this.currentSlideIndex = -1;
    this.started = null;

    this.state = {
      currentSlideIndex: this.currentSlideIndex,
      ...this.state
    };

    this.registerEvents = this.registerEvents.bind(this);
    this.pause = this.pause.bind(this);
    this.getCurrentSlideIndex = this.getCurrentSlideIndex.bind(this);
    this.goToSlideByIndex = this.goToSlideByIndex.bind(this);
    this.goToSlide = this.goToSlide.bind(this);

    this.goToSlideNumber = this.goToSlideNumber.bind(this);
    this.goToPreviousSlide = this.goToPreviousSlide.bind(this);
    this.goToNextSlide = this.goToNextSlide.bind(this);
    this.goToFirstSlide = this.goToFirstSlide.bind(this);
    this.goToLastSlide = this.goToLastSlide.bind(this);
    this.getSlideIndex = this.getSlideIndex.bind(this);

    this.registerEvents();

    this.navigationReady = true;
    this.init(callback);
  }

  init(callback) {
    if (this.navigationReady) {
      super.init(callback);
    }
  }

  registerEvents() {
    this.events.on('goToSlide', this.goToSlide);
    this.events.on('goToSlideNumber', this.goToSlideNumber);
    this.events.on('goToPreviousSlide', this.goToPreviousSlide);
    this.events.on('goToNextSlide', this.goToNextSlide);
    this.events.on('goToFirstSlide', this.goToFirstSlide);
    this.events.on('goToLastSlide', this.goToLastSlide);

    this.events.on('slidesChanged', () => {
      if (this.currentSlideIndex > this.getSlideCount()) {
        this.currentSlideIndex = this.getSlideCount();
      }
    });

    this.events.on('createClone', () => {
      if (!this.clone || this.clone.closed) {
        let options = super.getOptions();
        this.clone = window.open(location.href, options.cloneTarget, 'location=no');
      } else {
        this.clone.focus();
      }
    });

    this.events.on('resetTimer', () => {
      this.started = false;
    });
  }

  setState(state) {
    super.setState(state);

    if (state.hasOwnProperty('currentSlideIndex')) {
      this.goToSlideByIndex(state.currentSlideIndex);
    }
  }

  pause() {
    this.events.emit('togglePause');
  }

  getCurrentSlideIndex () {
    return this.currentSlideIndex;
  }

  goToSlideByIndex(slideIndex, noMessage) {
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
    this.updateState({
      currentSlideIndex: this.currentSlideIndex
    });
    this.events.emit('slideChanged', slideIndex + 1);

    if (!noMessage) {
      if (this.clone && !this.clone.closed) {
        this.clone.postMessage('goToSlide:' + (this.currentSlideIndex + 1), '*');
      }

      if (window.opener) {
        window.opener.postMessage('goToSlide:' + (this.currentSlideIndex + 1), '*');
      }
    }
  }

  goToSlide(slideNoOrName, noMessage) {
    let slideIndex = this.getSlideIndex(slideNoOrName);
    this.goToSlideByIndex(slideIndex, noMessage);
  }

  goToSlideNumber(slideNumber, noMessage) {
    let slides = this.getSlidesByNumber(parseInt(slideNumber, 10));

    if (slides && slides.length) {
      this.goToSlideByIndex(slides[0].getSlideIndex(), noMessage);
    }
  }

  goToPreviousSlide() {
    this.goToSlideByIndex(this.currentSlideIndex - 1);
  }

  goToNextSlide() {
    this.goToSlideByIndex(this.currentSlideIndex + 1);
  }

  goToFirstSlide() {
    this.goToSlideByIndex(0);
  }

  goToLastSlide() {
    this.goToSlideByIndex(this.getSlideCount() - 1);
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
};