!function (module) {

  /* bundle "src/remark/slide.js" */

  var slideshow = module.slideshow = {}
    , scaleFactor = 227
    , heightFactor = 3
    , widthFactor = 4
    ;

  slideshow.create = function (source, element) {
    var slides = createSlides(source, element)
      , positionElement = document.createElement('div')
      ;

    positionElement.className = 'position';
    element.appendChild(positionElement);

    styleElement(element);

    return {
      showSlide: function (slideIndex) {
        var slide = slides[slideIndex];
        module.exports.events.emit('slidein', slide.element(), slideIndex);
        element.appendChild(slide.element());
        positionElement.innerHTML = slideIndex + 1 + ' / ' + slides.length;
      }
    , hideSlide: function (slideIndex) {
        var slide = slides[slideIndex];
        module.exports.events.emit('slideout', slide.element(), slideIndex);
        element.removeChild(slide.element());
      }
    , getSlideCount: function () {
        return slides.length;
      }
    };
  };

  var createSlides = function (source, element) {
    var parts
      , slides = []
      , slide
      , i
      ;

    parts = source.split(/\n\n---\n/);

    for (i = 0; i < parts.length; ++i) {
      slides.push(module.slide.create(parts[i]));
    }

    return slides;
  };

  var styleElement = function (element) {
    var elementWidth = scaleFactor * widthFactor
      , elementHeight = scaleFactor * heightFactor
      ;

    var resize = function () {
      var containerHeight = window.innerHeight
        , containerWidth = window.innerWidth
        , scale
        ;

      if (containerWidth / widthFactor > containerHeight / heightFactor) {
        scale = containerHeight / (scaleFactor * heightFactor);
      }
      else {
        scale = containerWidth / (scaleFactor * widthFactor);
      }

      element.style['-webkit-transform'] = 'scale(' + scale + ')';
      element.style.MozTransform = 'scale(' + scale + ')';
      element.style.left = (containerWidth - elementWidth * scale) / 2 + 'px';
      element.style.top = (containerHeight - elementHeight * scale) / 2 + 'px';
    };

    element.style.width = scaleFactor * widthFactor + 'px';
    element.style.height = scaleFactor * heightFactor + 'px';

    window.onresize = resize;
    window.onresize();
  };

}(module);
