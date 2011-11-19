!function (context) {

  var remark = context.remark = context.remark || {}
    , slideshow = remark.slideshow = {}
    , scaleFactor = 227
    , heightFactor = 3
    , widthFactor = 4
    ;

  slideshow.create = function (source, element) {
    var slides = createSlides(source, element);

    styleElement(element);

    return {
      showSlide: function (slideIndex) {
        var slide = element.children[slideIndex];
        prepareSlideIfNeeded(slide, slides, slideIndex);
        remark.events.emit('slidein', slide, slideIndex);
        slide.style.display = 'table';
      }
    , hideSlide: function (slideIndex) {
        element.children[slideIndex].style.display = 'none';
      }
    , getSlideCount: function () {
        return slides.length;
      }
    };
  };

  var createSlides = function (source, element) {
    var slides
      , slide
      , content
      , i
      ;

    slides = source.split(/\n\n---\n/)

    for (i = 0; i < slides.length; ++i) {
      slide = document.createElement('div');
      slide.className = 'slide';
      content = document.createElement('div');
      content.className = 'content';
      slide.appendChild(content);
      element.appendChild(slide);
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

  var prepareSlideIfNeeded = function (slide, slides, slideIndex) {
    var content = slide.children[0];

    if (content.innerHTML === '') {
      content.innerHTML = slides[slideIndex];
      formatContent(content);
      appendPositionElement(content, slideIndex + 1, slides.length);
    }
  };

  var formatContent = function (content) {
    remark.converter.convertContentClasses(content);
    remark.converter.convertSlideClasses(content);
    remark.converter.convertMarkdown(content);
    remark.converter.convertCodeClasses(content);
    remark.highlighter.highlightCodeBlocks(content);
  };

  var appendPositionElement = function (content, slideNo, slideCount) {
    var positionElement = document.createElement('div');

    positionElement.className = 'position';
    positionElement.innerHTML = slideNo + ' / ' + slideCount;
    content.appendChild(positionElement);
  };

}(this);
