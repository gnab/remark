import {addClass, removeClass} from "../../utils";
import Dom from "../../Dom";


export default class Controls {
  constructor(slideShow, events, layout, backArrowStyle, tutorial) {
    this.slideShow = slideShow;
    this.events = events;

    this.element = Dom.createElement({
      className: 'remark-controls'
    });

    this.element.setAttribute('data-remark-controls-layout', layout);
    this.element.setAttribute('data-remark-controls-back-arrows', backArrowStyle);

    this.createControlButton = this.createControlButton.bind(this);

    this.prevButton = this.createControlButton(false);
    this.nextButton = this.createControlButton(true, tutorial);

    this.element.appendChild(this.prevButton);
    this.element.appendChild(this.nextButton);

    this.slideShow.events.on('afterShowSlide', (slideIndex) => {
      let disabledClass = 'remark-controls__button--disabled';
      removeClass(this.prevButton, disabledClass);
      removeClass(this.nextButton, disabledClass);

      if (slideIndex === 0) {
        addClass(this.prevButton, disabledClass);
      } else if (this.slideShow.getSlides().length - 1 === slideIndex) {
        addClass(this.nextButton, disabledClass);
      }
    });
  }

  createControlButton(next, tutorial) {
    let classPrefix = 'remark-controls__button--';
    let className = (classPrefix + (next ? 'next' : 'prev')) + ((tutorial) ? ' ' + classPrefix + 'highlight' : '');

    let button = Dom.createElement({
      className: 'remark-controls__button ' + className,
    });

    button.onclick = () => {
      this.events.emit(next ? 'goToNextSlide' : 'goToPreviousSlide');
    };

    return button;
  }
}
