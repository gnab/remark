var api = require('./remark/api')
  , controller = require('./remark/controller')
  , converter = require('./remark/converter')
  , dispatcher = require('./remark/dispatcher')
  , highlighter = require('./remark/highlighter')
  , slideshow = require('./remark/slideshow')

  , styles = require('./remark.less')

window.remark = api;

window.onload = function () {
  var sourceElement = document.getElementById('source')
    , slideshowElement = document.getElementById('slideshow')
    ;

  if (!assureElementsExist(sourceElement, slideshowElement)) {
    return;
  }

  sourceElement.style.display = 'none';

  styleDocument();
  setupSlideshow(sourceElement, slideshowElement);
};

var assureElementsExist = function (sourceElement, slideshowElement) {
  if (!sourceElement) {
    alert('remark error: source element not present.')
    return false;
  }

  if (!slideshowElement) {
    alert('remark error: slideshow element not present.')
    return false;
  }

  return true;
};

var styleDocument = function () {
  var styleElement = document.createElement('style')
    , headElement = document.getElementsByTagName('head')[0]
    ;

  styleElement.type = 'text/css';
  styleElement.innerHTML = styles;
  styleElement.innerHTML += highlighter.cssForStyle();

  headElement.insertBefore(styleElement, headElement.firstChild);
};

var setupSlideshow = function (sourceElement, slideshowElement) {
  var source = sourceElement.innerHTML
    , show
    ;

  show = slideshow.create(source, slideshowElement);
  controller.create(show);
  dispatcher.create();
};
