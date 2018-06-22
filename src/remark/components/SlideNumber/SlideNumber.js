export default class SlideNumber {
  constructor(slide, slideShow) {
    this.slide = slide;
    this.slideShow = slideShow;

    this.formatSlideNumber = this.formatSlideNumber.bind(this);

    this.element = document.createElement('div');
    this.element.className = 'remark-slide-number';
    this.element.innerHTML = this.formatSlideNumber();
  }

  formatSlideNumber() {
    let format = this.slideShow.getOptions().slideNumberFormat;
    let slides = this.slideShow.getSlides();
    let current = this.slide.getSlideNumber();
    let total = (slides[slides.length - 1]).getSlideNumber();

    if (typeof format === 'function') {
      return format.call(slideshow, current, total);
    }

    return format
      .replace('%current%', current)
      .replace('%total%', total);
  }
}

