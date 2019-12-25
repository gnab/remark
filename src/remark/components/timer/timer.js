var utils = require('../../utils');

module.exports = TimerViewModel;

function TimerViewModel(events, element) {
  var self = this;

  self.events = events;
  self.element = element;
  self.chronos = new Chronos();
  self.state = self.INITIAL;

  element.innerHTML = '0:00:00';

  self.reset();

  events.on('startTimer', function () {
    self.state = self.RUNNING;
  });

  events.on('pauseTimer', function () {
    self.state = self.PAUSED;
  });

  events.on('resetTimer', function () {
    self.reset();
  });


  setInterval(function () {
    self.tick();
  }, 100);

}
TimerViewModel.prototype.tick = function () {
  var self = this;

  self.chronos.tick();
  self.state.update(self.chronos);
};
TimerViewModel.prototype.reset = function () {
  var self = this;

  self.chronos = new Chronos();
  self.state = self.INITIAL;
};

TimerViewModel.prototype.INITIAL = new State('INITIAL', function (chronos) { /* do nothing */ });
TimerViewModel.prototype.RUNNING = new State('RUNNING', function (chronos) { chronos.addDelta(); });
TimerViewModel.prototype.PAUSED = new State('PAUSED', function (chronos) { /* do nothing */ });

function Chronos() {
  var self = this;

  var now = new Date().getTime();
  self.currentTick = now;
  self.lastTick = now;
  self.elapsedTime = 0;
}
Chronos.prototype.tick = function () {
  var self = this;

  var now = new Date().getTime();
  self.lastTick = self.currentTick;
  self.currentTick = now;
};
Chronos.prototype.addDelta = function () {
  var self = this;

  var delta = self.currentTick - self.lastTick;
  self.elapsedTime += delta;
};

function State(identifier, updater) {
  var self = this;

  self.identifier = identifier;
  self.updater = updater;
}
State.prototype.update = function (chronos) {
  this.updater(chronos);
};