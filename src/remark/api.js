var EventEmitter = require('events').EventEmitter
  , api = module.exports = new EventEmitter()
  , events = require('./events')
  ;

api.loadFromString = function (source) {
  events.emit('loadFromString', source);
};
