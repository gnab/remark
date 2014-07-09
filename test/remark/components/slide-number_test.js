var SlideNumber = require('components/slide-number');

describe('Slide number', function () {
  var slideNumber;

  it('should display according to format', function () {
    var slide = { number: 2 }
      , slideshow = {
          getSlideNumberFormat: function () {
            return '%current% / %total%';
          }
        , getSlides: function () { return [1,2,3]; }
      };

    slideNumber = new SlideNumber(slide, slideshow);

    slideNumber.element.innerHTML.should.equal('2 / 3');
  });
});
