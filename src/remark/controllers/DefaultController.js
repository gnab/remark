// Allow override of global `location`
/* global location:true */
import Keyboard from './inputs/Keyboard';
import Location from './inputs/Location';
import Message from './inputs/Message';
import Mouse from './inputs/Mouse';
import Touch from './inputs/Touch';

export default class DefaultController {
  constructor(events, dom, slideShowView, options) {
    options = options || {};

    this.addApiEventListeners = this.addApiEventListeners.bind(this);

    this.keyboard = new Keyboard(events);
    this.location = new Location(events, dom, slideShowView);
    this.message = new Message(events);
    this.mouse = new Mouse(events, options);
    this.touch = new Touch(events, options);

    this.location.activate();
    this.message.activate();
    this.mouse.activate();
    this.touch.register(events, options);

    this.addApiEventListeners(events);
  }

  addApiEventListeners(events) {
    events.on('pause', (event) => {
      this.keyboard.deactivate();
      this.mouse.deactivate();
      this.touch.deactivate();
    });

    events.on('resume',  (event) => {
      this.keyboard.activate();
      this.mouse.activate();
      this.touch.activate();
    });
  }
}