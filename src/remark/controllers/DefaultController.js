// Allow override of global `location`
/* global location:true */
import Keyboard from './inputs/Keyboard';
import Location from './inputs/Location';
import Message from './inputs/Message';
import Mouse from './inputs/Mouse';
import Touch from './inputs/Touch';

export default class DefaultController {
  constructor(events, slideShowView, options) {
    this.addApiEventListeners = this.addApiEventListeners.bind(this);

    this.pauseActive = false;
    this.location = new Location(events, slideShowView);
    this.message = new Message(events);

    this.location.activate();
    this.message.activate();

    if (options.allowControl) {
      this.keyboard = new Keyboard(events);
      this.mouse = new Mouse(events, options.navigation);
      this.touch = new Touch(events, options.navigation);

      this.mouse.activate();
      this.touch.activate();
      this.addApiEventListeners(events);
    }
  }

  addApiEventListeners(events) {
    events.on('togglePause', (event) => {
      if (this.pauseActive === false) {
        this.keyboard.deactivate();
        this.mouse.deactivate();
        this.touch.deactivate();
      } else {
        this.keyboard.activate();
        this.mouse.activate();
        this.touch.activate();
      }

      this.pauseActive = !this.pauseActive;
    });
  }
}