module.exports = SlideNumberViewModel;

function SlideNumberViewModel (slide, slideshow) {
  var self = this;

  self.slide = slide;
  self.slideshow = slideshow;

  self.element = document.createElement('div');
  self.element.className = 'remark-slide-number';
  self.element.innerHTML = formatSlideNumber(self.slide, self.slideshow);
}

function formatSlideNumber (slide, slideshow) {
  var format = slideshow.getSlideNumberFormat()
    , current = slide.number
    , total = slideshow.getSlides().length
    ;

  if (typeof format === 'function') {
    return format(current, total);
  }

  return format
      .replace('%current%', current)
      .replace('%total%', total);
}
