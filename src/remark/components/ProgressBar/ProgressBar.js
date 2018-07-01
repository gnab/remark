export default class ProgressBar {
  constructor(slideShow) {
    this.slideShow = slideShow;

    this.element = document.createElement('div');
    this.element.className = 'remark-progress-bar-container';
    this.progressElement = document.createElement('div');
    this.progressElement.className = 'remark-progress-bar';
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
