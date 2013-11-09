var EventEmitter = require('events').EventEmitter
  , highlighter = require('./highlighter')
  , Slideshow = require('./models/slideshow')
  , SlideshowView = require('./views/slideshowView')
  , Controller = require('./controller')
  ;

// Expose highlighter to allow enumerating available styles and
// including external language grammars
module.exports.highlighter = highlighter;

// Creates slideshow initialized from options
module.exports.create = function (options) {
  var events
    , slideshow
    , slideshowView
    , controller
    ;

  options = applyDefaults(options);

  events = new EventEmitter();
  events.setMaxListeners(0);

  slideshow = new Slideshow(events, options);
  slideshowView = new SlideshowView(events, options.container, slideshow);
  controller = new Controller(events, slideshowView, options.handleInputs);

  return slideshow;
};

function applyDefaults (options) {
  var sourceElement;

  options = options || {};

  if (!options.hasOwnProperty('source')) {
    sourceElement = document.getElementById('source');
    if (sourceElement) {
      options.source = sourceElement.innerHTML;
      sourceElement.style.display = 'none';
    }
  }

  if (!(options.container instanceof window.HTMLElement)) {
    options.container = document.body;
  }

  if (!options.hasOwnProperty('handleInputs')) {
    options.handleInputs = true;
  }

  return options;
}
