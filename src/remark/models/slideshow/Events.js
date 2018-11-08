import EventEmitter from 'events';

export default (superClass) => class extends superClass {
  constructor(events, options, callback) {
    super(events, options, callback);
    this.on = this.on.bind(this);

    this.externalEvents = new EventEmitter();
    this.externalEvents.setMaxListeners(0);

    const eventsMap = [
      'showSlide',
      'hideSlide',
      'beforeShowSlide',
      'afterShowSlide',
      'beforeHideSlide',
      'afterHideSlide',
      'toggledPresenter'
    ];

    eventsMap.map((eventName) => {
      this.events.on(eventName, (slideIndex) => {
        let slide = this.getSlides()[slideIndex];
        this.externalEvents.emit(eventName, slide);
      });
    });

    this.eventsReady = true;
    this.init(callback);
  }

  init(callback) {
    if (this.eventsReady) {
      super.init(callback);
    }
  }

  on() {
    this.externalEvents.on.apply(this.externalEvents, arguments);
    return this;
  }
};