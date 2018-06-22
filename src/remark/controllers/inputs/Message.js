export default class Message {
  constructor(events) {
    this.events = events;

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.addMessageEventListeners = this.addMessageEventListeners.bind(this);
  }

  activate() {
    this.addMessageEventListeners();
  }

  deactivate() {
    // Do nothing
  }

  addMessageEventListeners() {
    this.events.on('message', (message) => {
      let cap = /^gotoSlide:(\d+)$/.exec(message.data);

      if (cap !== null) {
        this.events.emit('gotoSlide', parseInt(cap[1], 10), true);
      } else if (message.data === 'toggleBlackout') {
        this.events.emit('toggleBlackout', {propagate: false});
      }
    });
  }
}
