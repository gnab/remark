// Allow override of global `location`
/* global location:true */

module.exports = Controller;

var Keyboard = require('./inputs/keyboard')
  , mouse = require('./inputs/mouse')
  , touch = require('./inputs/touch')
  , message = require('./inputs/message')
  , location = require('./inputs/location')
  ;

function Controller (events, dom, slideshowView, options) {

  var keyboard = new Keyboard(events, options);

  var navigationOptions = options ? options.navigation || {} : {};

  message.register(events);
  location.register(events, dom, slideshowView);
  mouse.register(events, navigationOptions);
  touch.register(events, navigationOptions);

  addApiEventListeners(events, keyboard, slideshowView, navigationOptions);
}

function addApiEventListeners (events, keyboard, slideshowView, options) {
  events.on('pause', function(event) {
    keyboard.deactivate();
    mouse.unregister(events);
    touch.unregister(events);
  });

  events.on('resume',  function(event) {
    keyboard.activate();
    mouse.register(events, options);
    touch.register(events, options);
  });
}