import EventEmitter from 'events';

export default (superClass) => class extends superClass {
  constructor(events) {
    super();
    this.events = events;
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
  }

  on() {
    this.externalEvents.on.apply(this.externalEvents, arguments);
    return this.slideShow; // Todo not sure if this or this.slideShow
  };
};