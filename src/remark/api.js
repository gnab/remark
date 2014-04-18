var EventEmitter = require('events').EventEmitter
  , highlighter = require('./highlighter')
  , Slideshow = require('./models/slideshow')
  , SlideshowView = require('./views/slideshowView')
  , Controller = require('./controller')
  , utils = require('./utils')
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
  controller = options.controller || new Controller(events, slideshowView,
    options.navigation);

  return slideshow;
};

function applyDefaults (options) {
  var sourceElement;

  options = options || {};

  if (options.hasOwnProperty('sourceUrl')) {
    var req = new XMLHttpRequest();
    req.open('GET', options.sourceUrl, false);
    req.send();
    options.source = req.responseText;
  }
  else if (!options.hasOwnProperty('source')) {
    sourceElement = document.getElementById('source');
    if (sourceElement) {
      options.source = unescape(sourceElement.innerHTML);
      sourceElement.style.display = 'none';
    }
  }

  if (!(options.container instanceof window.HTMLElement)) {
    options.container = utils.getBodyElement();
  }

  return options;
}

function unescape (source) {
  source = source.replace(/&[l|g]t;/g,
    function (match) {
      return match === '&lt;' ? '<' : '>';
    });

  source = source.replace(/&amp;/g, '&');
  source = source.replace(/&quot;/g, '"');

  return source;
}
