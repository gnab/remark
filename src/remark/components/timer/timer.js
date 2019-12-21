var utils = require('../../utils');

module.exports = TimerViewModel;

function TimerViewModel(events, element) {
  var self = this;

  self.events = events;
  self.element = element;
  self.chronos = initialChronos();

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


  setInterval(function () {
    self.tick();
  }, 100);

}

TimerViewModel.prototype.tick = function () {
  var self = this;

  var now = new Date().getTime();
  self.chronos.lastTick = self.chronos.currentTick;
  self.chronos.currentTick = now;
  self.state.update(self.chronos);
};

TimerViewModel.prototype.INITIAL = new State('INITIAL', function (chronos) { /* do nothing */ });
TimerViewModel.prototype.RUNNING = new State('RUNNING', function (chronos) { var delta = chronos.currentTick - chronos.lastTick; chronos.elapsedTime += delta; });
TimerViewModel.prototype.PAUSED = new State('PAUSED', function (chronos) { /* do nothing */ });

function initialChronos() {
  var now = new Date().getTime();
  return {
    currentTick: now,
    lastTick: now,
    elapsedTime: 0
  };
}

function State(identifier, updater) {
  var self = this;

  self.identifier = identifier;
  self.updater = updater;
}

State.prototype.update = function (chronos) {
  this.updater(chronos);
};