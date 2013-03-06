var utils = require('./remark/utils')
  , api = require('./remark/api')
  , config = require('./remark/config')
  , events = require('./remark/events')
  , Controller = require('./remark/controller').Controller
  , Dispatcher = require('./remark/dispatcher')
  , highlighter = require('./remark/highlighter')
  , Slideshow = require('./remark/models/slideshow').Slideshow
  , SlideshowView = require('./remark/views/slideshowView').SlideshowView
  , resources = require('./remark/resources')
  ;

window.remark = api;

window.addEventListener('load', function () {
  var sourceElement = document.getElementById('source')
    , slideshowElement = document.getElementById('slideshow')
    ;

  if (!assureElementsExist(sourceElement, slideshowElement)) {
    return;
  }

  sourceElement.style.display = 'none';

  styleDocument();
  setupSlideshow(sourceElement, slideshowElement);

  api.emit('ready');
});

function assureElementsExist (sourceElement, slideshowElement) {
  if (!sourceElement) {
    alert('remark error: source element not present.');
    return false;
  }

  if (!slideshowElement) {
    alert('remark error: slideshow element not present.');
    return false;
  }

  return true;
}

function styleDocument () {
  var styleElement = document.createElement('style')
    , headElement = document.getElementsByTagName('head')[0]
    ;

  styleElement.type = 'text/css';
  headElement.insertBefore(styleElement, headElement.firstChild);

  events.on('config', onConfig);
  onConfig();

  function onConfig () {
    var highlighterStyle;
    
    if (config.highlightStyle === null) {
      highlighterStyle = '';
    }
    else {
      highlighterStyle = 
        highlighter.styles[config.highlightStyle] ||
        highlighter.styles['default'];
    }
    
    styleElement.innerHTML = resources.documentStyles + highlighterStyle;
  }
}

function setupSlideshow (sourceElement, slideshowElement) {
  var source = sourceElement.innerHTML
    , slideshow
    , slideshowView
    , controller
    , dispatcher
    ;

  slideshow = new Slideshow(source);
  slideshowView = new SlideshowView(slideshow, slideshowElement);
  controller = new Controller(slideshow);
  dispatcher = new Dispatcher();
}
