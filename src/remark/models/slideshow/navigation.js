module.exports = Navigation;

function Navigation (events) {
  var self = this
    , currentSlideNo = 0
    ;

  self.getCurrentSlideNo = getCurrentSlideNo;
  self.gotoSlide = gotoSlide;
  self.gotoPreviousSlide = gotoPreviousSlide;
  self.gotoNextSlide = gotoNextSlide;
  self.gotoFirstSlide = gotoFirstSlide;
  self.gotoLastSlide = gotoLastSlide;

  events.on('gotoSlide', gotoSlide);
  events.on('gotoPreviousSlide', gotoPreviousSlide);
  events.on('gotoNextSlide', gotoNextSlide);
  events.on('gotoFirstSlide', gotoFirstSlide);
  events.on('gotoLastSlide', gotoLastSlide);

  events.on('slidesChanged', function () {
    if (currentSlideNo > self.getSlideCount()) {
      currentSlideNo = self.getSlideCount();
    }
  });

  function getCurrentSlideNo () {
    return currentSlideNo;
  }

  function gotoSlide (slideNoOrName) {
    var slideNo = self.getSlideNo(slideNoOrName)
      , alreadyOnSlide = slideNo === currentSlideNo
      , slideOutOfRange = slideNo < 1 || slideNo > self.getSlideCount()
      ;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideNo !== 0) {
      events.emit('hideSlide', currentSlideNo - 1);
    }

    events.emit('showSlide', slideNo - 1);

    currentSlideNo = slideNo;

    events.emit('slideChanged', slideNoOrName || slideNo);
  }

  function gotoPreviousSlide() {
    self.gotoSlide(currentSlideNo - 1);
  }
  
  function gotoNextSlide() {
    self.gotoSlide(currentSlideNo + 1);
  }
  
  function gotoFirstSlide () {
    self.gotoSlide(1);
  }
  
  function gotoLastSlide () {
    self.gotoSlide(self.getSlideCount());
  }
}
