var EventEmitter = require('events').EventEmitter
  , highlighter = require('./highlighter')
  , events = require('./events')
  , api = module.exports = new EventEmitter()
  ;

api.highlighter = {
  engine: function() {
    return highlighter.engine;
  }
};

api.loadFromString = function (source) {
  events.emit('loadFromString', source);
};

api.gotoSlide = function (slideNoOrName) {
  events.emit('gotoSlide', slideNoOrName);
};

api.gotoPreviousSlide = function () {
  events.emit('gotoPreviousSlide');
};

api.gotoNextSlide = function () {
  events.emit('gotoNextSlide');
};

api.gotoFirstSlide = function () {
  events.emit('gotoFirstSlide');
};

api.gotoLastSlide = function () {
  events.emit('gotoLastSlide');
};
