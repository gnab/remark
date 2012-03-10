var EventEmitter = require('events').EventEmitter
  , config = require('./config')
  , api = module.exports = new EventEmitter()
  ;

api.config = config;
