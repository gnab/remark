import Dom from "../../Dom";

export default class SlideNumber {
  constructor(slide, slideShow) {
    this.slide = slide;
    this.slideShow = slideShow;

    this.formatSlideNumber = this.formatSlideNumber.bind(this);

    this.element = Dom.createElement({
      className: 'remark-slide-number',
      innerHTML: this.formatSlideNumber()
    });
  }

  formatSlideNumber() {
    let format = this.slideShow.getOptions().slideNumberFormat;
    let slides = this.slideShow.getSlides();
    let current = this.slide.getSlideNumber();
    let total = (slides[slides.length - 1]).getSlideNumber();

    if (typeof format === 'function') {
      return format.call(this.slideShow, current, total);
    }

    return format
      .replace('%current%', current)
      .replace('%total%', total);
  }
}

