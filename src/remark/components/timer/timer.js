var utils = require('../../utils');

module.exports = TimerViewModel;

function TimerViewModel(events, element) {
  var self = this;

  self.element = element;
  self.reset();

  events.on('startTimer', function () {
    self.start();
  });

  events.on('pauseTimer', function () {
    self.pause();
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
  self.view.update(self.chronos.elapsedTime);
};
TimerViewModel.prototype.start = function () {
  var self = this;

  self.state = self.RUNNING;
};
TimerViewModel.prototype.pause = function () {
  var self = this;

  self.state = self.PAUSED;
};
TimerViewModel.prototype.reset = function () {
  var self = this;

  self.chronos = new Chronos();
  self.state = self.INITIAL;
  self.view = new TimerView(self.element);
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

function TimerView(element) {
  var self = this;

  self.element = element;
  self.formatter = function (hours, minutes, seconds, millis) {
    return [hours, minutes, seconds]
      .map(function (d) { return '' + d; })
      .map(function (s) { return padStart(s, 2, '0'); })
      .join(':');
  };
}
TimerView.prototype.update = function (elapsedTime) {
  var self = this;

  var left = elapsedTime;
  var millis = left % 1000; left = idiv(left, 1000);
  var seconds = left % 60; left = idiv(left, 60);
  var minutes = left % 60; left = idiv(left, 60);
  var hours = left;

  var content = self.formatter(hours, minutes, seconds, millis);
  self.element.innerHTML = content;
};

function idiv(n, d) {
  return Math.floor(n / d);
}

function padStart(s, length, pad) {
  var result = s;
  while (result.length < length) {
    result = pad + result;
  }
  return result;
}