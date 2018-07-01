import {addClass, removeClass} from "../../utils";


export default class Controls {
  constructor(slideShow, events, tutorial, layout, backArrowStyle) {
    this.slideShow = slideShow;
    this.events = events;

    this.element = document.createElement('div');
    this.element.className = 'remark-controls';

    this.createControlButton = this.createControlButton.bind(this);

    this.prevButton = this.createControlButton(false);
    this.nextButton = this.createControlButton(true);

    this.element.appendChild(this.prevButton);
    this.element.appendChild(this.nextButton);

    this.slideShow.events.on('afterShowSlide', (slideIndex) => {
      let disabledClass = 'remark-controls-button--disabled';
      removeClass(this.prevButton, disabledClass);
      removeClass(this.nextButton, disabledClass);

      if (slideIndex === 0) {
        addClass(this.prevButton, disabledClass);
      } else if (this.slideShow.getSlides().length - 1 === slideIndex) {
        addClass(this.nextButton, disabledClass);
      }
    });
  }

  createControlButton(next) {
    let button = document.createElement('div');
    button.className = 'remark-controls-button remark-controls-button--' + (next ? 'next' : 'prev');

    button.onclick = () => {
      this.events.emit(next ? 'gotoNextSlide' : 'gotoPreviousSlide');
    };

    return button;
  }
}
