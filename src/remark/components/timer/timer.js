var utils = require('../../utils');

module.exports = TimerViewModel;

function TimerViewModel (events, element) {
  var self = this;

  self.events = events;
  self.element = element;

  self.state = self.INITIAL;

  element.innerHTML = '0:00:00';

  events.on('startTimer', function () {
    self.state = self.RUNNING;
  });

  events.on('pauseTimer', function () {
    self.state = self.PAUSED;
  });

  events.on('resetTimer', function () {
    self.state = self.INITIAL;
  });


  setInterval(function() {
      self.tick();
    }, 100);

}

TimerViewModel.prototype.tick = function () {
};

TimerViewModel.prototype.INITIAL = {};
TimerViewModel.prototype.RUNNING = {};
TimerViewModel.prototype.PAUSED  = {};