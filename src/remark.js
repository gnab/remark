!function (context) {

  /* bundle "vendor/EventEmitter.min.js" */

  var module = {
    events: new EventEmitter()
  , exports: {
      events: new EventEmitter()
    }
  };

  context.remark = module.exports;

  /* bundle "src/remark/config.js" */
  /* bundle "src/remark/controller.js" */
  /* bundle "src/remark/converter.js" */
  /* bundle "src/remark/dispatcher.js" */
  /* bundle "src/remark/highlighter.js" */
  /* bundle "src/remark/slideshow.js" */

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
    styleElement.innerHTML = '/* bundle "src/remark.css" */';
    styleElement.innerHTML += module.highlighter.cssForStyle();

    headElement.insertBefore(styleElement, headElement.firstChild);
  };

  var setupSlideshow = function (sourceElement, slideshowElement) {
    var source = sourceElement.innerHTML
      , slideshow
      ;

    slideshow = module.slideshow.create(source, slideshowElement);
    module.controller.create(slideshow);
    module.dispatcher.create();
  };

}(this);
