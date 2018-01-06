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

  function createSlide (index) {
    return {
      getSlideIndex: function () { return index; },
      getSlideNumber: function () { return index + 1; },
      properties: {}
    }
  }
});
