var utils = require('./remark/utils')
  , api = require('./remark/api')
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
    , styles = resources.documentStyles + highlighter.cssForStyle()
    ;

  styleElement.type = 'text/css';
  styleElement.innerHTML = styles;

  headElement.insertBefore(styleElement, headElement.firstChild);
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
