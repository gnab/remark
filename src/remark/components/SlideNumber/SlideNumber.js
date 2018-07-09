import Dom from "../../Dom";

export default class SlideNumber {
  constructor(slideShow, slideNumber, refresh) {
    this.slideShow = slideShow;
    this.refresh = refresh || false;

    this.formatSlideNumber = this.formatSlideNumber.bind(this);

    this.element = Dom.createElement({
      className: 'remark-slide-number',
      innerHTML: this.formatSlideNumber(slideNumber)
    });

    if (this.refresh) {
      this.slideShow.events.on('afterShowSlide', (slideIndex) => {
        this.element.innerHTML = this.formatSlideNumber(slideIndex);
      });
    }
  }

  formatSlideNumber(slideIndex) {
    let format = this.slideShow.getOptions().slideNumberFormat;
    let slides = this.slideShow.getSlides();
    let current = slideIndex + 1;
    let total = (slides[slides.length - 1]).getSlideNumber();

    if (typeof format === 'function') {
      return format.call(this.slideShow, current, total);
    }

    return format
      .replace('%current%', current)
      .replace('%total%', total);
  }
}

