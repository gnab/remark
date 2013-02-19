var EventEmitter = require('events').EventEmitter
  , api = module.exports = new EventEmitter()
  ;

api.exports = new EventEmitter();

api.exports.loadFromString = function (source) {
  api.emit('loadFromString', source);
};
