import Dom from "../../Dom";

export default class ProgressBar {
  constructor(slideShow) {
    this.slideShow = slideShow;

    this.element = Dom.createElement({className: 'remark-progress-bar'});
    this.progressElement = Dom.createElement({className: 'remark-progress-bar__bar'});
    this.element.appendChild(this.progressElement);

    this.updateProgressBar = this.updateProgressBar.bind(this);

    this.updateProgressBar(this.slideShow.getCurrentSlideIndex());

    this.slideShow.events.on('afterShowSlide', (slideIndex) => {
      this.updateProgressBar(slideIndex);
    });
  }

  updateProgressBar(slideIndex) {
    const current = slideIndex;
    const slides = this.slideShow.getSlides();
    const total = slides.length - 1;
    this.progressElement.style.width = `${current/total*100}%`;
  }
}
