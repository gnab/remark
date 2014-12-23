var SlideNumber = require('components/slide-number');

describe('Slide number', function () {
  var slideNumber;

  it('should display according to format', function () {
    var slide = createSlide(1)
      , slideshow = {
          getSlideNumberFormat: function () {
            return '%current% / %total%';
          }
        , getSlides: function () { return [
            createSlide(0),
            slide,
            createSlide(2)
          ];
        }
      };

    slideNumber = new SlideNumber(slide, slideshow);

    slideNumber.element.innerHTML.should.equal('2 / 3');
  });

  it('should not count slide marked not to be counted', function () {
    var slide = createSlide(1)
      , slideshow = {
          getSlideNumberFormat: function () {
            return '%current% / %total%';
          }
        , getSlides: function () { return [
            createSlide(0, false),
            slide
          ];
        }
      };

    slideNumber = new SlideNumber(slide, slideshow);

    slideNumber.element.innerHTML.should.equal('1 / 1');
  });

  function createSlide (index, count) {
    var slide = {
      getSlideIndex: function () { return index; },
      properties: {}
    }

    if (count === false) {
      slide.properties.count = 'false';
    }

    return slide;
  }
});
