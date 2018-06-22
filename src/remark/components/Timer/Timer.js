export default class Timer {
  constructor(events, element) {
    this.events = events;
    this.element = element;

    this.startTime = null;
    this.pauseStart = null;
    this.pauseLength = 0;

    element.innerHTML = '0:00:00';

    setInterval(() => {
      this.updateTimer();
    }, 100);

    events.on('start', () => {
      // When we do the first slide change, start the clock.
      this.startTime = new Date();
    });

    events.on('resetTimer', () => {
      // If we reset the timer, clear everything.
      this.startTime = null;
      this.pauseStart = null;
      this.pauseLength = 0;
      this.element.innerHTML = '0:00:00';
    });

    events.on('pause', () => {
      this.pauseStart = new Date();
    });

    events.on('resume', () => {
      this.pauseLength += new Date() - this.pauseStart;
      this.pauseStart = null;
    });
  }

  updateTimer() {
    if (this.startTime) {
      let milliSeconds;
      // If we're currently paused, measure elapsed time from the pauseStart.
      // Otherwise, use "now".
      if (this.pauseStart) {
        milliSeconds = this.pauseStart - this.startTime - this.pauseLength;
      } else {
        milliSeconds = new Date() - this.startTime - this.pauseLength;
      }

      let seconds = Math.floor(milliSeconds / 1000) % 60;
      let minutes = Math.floor(milliSeconds / 60000) % 60;
      let hours = Math.floor(milliSeconds / 3600000);

      this.element.innerHTML = hours + (minutes > 9 ? ':' : ':0') + minutes + (seconds > 9 ? ':' : ':0') + seconds;
    }
  }
}