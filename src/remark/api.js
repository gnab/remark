var EventEmitter = require('events').EventEmitter
  , api = module.exports = new EventEmitter()
  , dom = require('./dom')
  , dispatcher = require('./dispatcher')
  ;

api.addListener('pauseRemark', function () {
    dispatcher.disableinteraction();
});

api.addListener('resumeRemark', function () {
    dispatcher.enableinteraction();
});

api.addListener('gotoPrevSlide', function() {
    dispatcher.emit('gotoPreviousSlide');
});

api.addListener('gotoNextSlide', function() {
    dispatcher.emit('gotoNextSlide');
});
