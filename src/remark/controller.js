!function (module) {

  var controller = module.controller = {}
    , currentSlideIndex = -1;
    ;

  controller.create = function (slideshow) {
    var navigate = function () {
      slideNo = parseInt((location.hash || '').substr(1), 10) || 1;
      gotoSlide(slideshow, slideNo - 1);
    }

    window.onhashchange = navigate;
    navigate();

    module.events.on('previousSlide', function() {
      gotoSlide(slideshow, currentSlideIndex - 1);
    });

    module.events.on('nextSlide', function() {
      gotoSlide(slideshow, currentSlideIndex + 1);
    });
  };

  var gotoSlide = function (slideshow, slideIndex) {
    var alreadyOnSlide = slideIndex === currentSlideIndex
      , lastSlideIndex = slideshow.getSlideCount() - 1
      , slideOutOfRange = slideIndex < 0 || slideIndex > lastSlideIndex
      ;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideIndex !== -1) {
      slideshow.hideSlide(currentSlideIndex);
    }

    slideshow.showSlide(slideIndex);

    currentSlideIndex = slideIndex;
    location.hash = currentSlideIndex + 1;
  };

}(module);
