!function (context) {

  /* bundle "src/remark/controller.js" */
  /* bundle "src/remark/converter.js" */
  /* bundle "src/remark/slideshow.js" */

  var remark = context.remark = context.remark || {};

  window.onload = function () {
    var sourceElement = document.getElementById('source')
      , slideshowElement = document.getElementById('slideshow')
      ;

    if (!sourceElement) {
      alert('remark error: source element not present.')
      return;
    }

    if (!slideshowElement) {
      alert('remark error: slideshow element not present.')
      return;
    }
       
    sourceElement.style.display = 'none';

    styleDocument();
    setupSlideshow(sourceElement, slideshowElement);
  };

  var setupSlideshow = function (sourceElement, slideshowElement) {
    var source = sourceElement.innerHTML
      , slideshow
      , controller
      ;

    slideshow = remark.slideshow.create(source, slideshowElement);
    controller = remark.controller.create(slideshow);
    mapKeys(controller);
    mapTouches(controller);
    mapWheel(controller);
  };

  var styleDocument = function () {
    var style = createStyle();
    addElementToHead(style);
  };

  var createStyle = function () {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '/* bundle "src/remark.css" */';

    return style;
  };

  var addElementToHead = function (element) {
    var head = document.getElementsByTagName('head')[0];
    head.insertBefore(element, head.firstChild);
  };

  var mapKeys = function (controller) {
    window.onkeydown = function (event) {
      switch (event.keyCode) {
        case 33:
        case 37:
        case 38:
        case 75:
          controller.gotoPreviousSlide();
          break;
        case 32:
        case 34:
        case 39:
        case 40:
        case 74:
          controller.gotoNextSlide();
          break;
      }
    };
  };

  var mapTouches = function (controller) {
    var width = window.innerWidth
      , touch
      ;

    document.addEventListener('touchend', function (event) {
      if (event.target.nodeName.toUpperCase() === 'A') {
        return;
      }

      touch = event.changedTouches[0];

      if (touch.clientX < width / 2) {
        controller.gotoPreviousSlide();
      }
      else {
        controller.gotoNextSlide();
      }
    });

    document.addEventListener('touchmove', function (event) {
      event.preventDefault();
    });
  };

  var mapWheel = function (controller) {
    document.addEventListener('mousewheel', function (event) {
      if (event.wheelDeltaY > 0) {
        controller.gotoPreviousSlide();
      }
      else if (event.wheelDeltaY < 0) {
        controller.gotoNextSlide();
      };
    });
  };

}(this);
