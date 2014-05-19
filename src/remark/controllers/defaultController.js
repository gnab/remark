// Allow override of global `location`
/* global location:true */

module.exports = Controller;

var keyboard = require('./inputs/keyboard')
  , mouse = require('./inputs/mouse')
  , touch = require('./inputs/touch')
  , message = require('./inputs/message')
  , location = require('./inputs/location')
  ;

function Controller (events, dom, slideshowView, options) {
  options = options || {};

  message.register(events);
  location.register(events, dom, slideshowView);
  keyboard.register(events);
  mouse.register(events, options);
  touch.register(events, options);

  addApiEventListeners(events, slideshowView, options);
}

function addApiEventListeners(events, slideshowView, options) {
  events.on('pause', function(event) {
    keyboard.unregister(events);
    mouse.unregister(events);
    touch.unregister(events);
  });

  events.on('resume',  function(event) {
    keyboard.register(events);
    mouse.register(events, options);
    touch.register(events, options);
  });
}
