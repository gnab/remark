import SlideNumber from '../components/SlideNumber/SlideNumber';
import Converter from '../Converter';
import { addClass, removeClass } from '../utils';
import CodeBlockHighlighter from "./CodeBlockHighlighter";

export default class SlideView {
  constructor(events, slideShow, scaler, slide) {
    this.events = events;
    this.slideShow = slideShow;
    this.scaler = scaler;
    this.slide = slide;

    this.converter = new Converter();
    this.codeBlockHighlighter = new CodeBlockHighlighter(slideShow);
    this.slideNumber = new SlideNumber(slide, slideShow);

    this.updateDimensions = this.updateDimensions.bind(this);
    this.scale = this.scale.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.createSlideElement = this.createSlideElement.bind(this);
    this.styleContentElement = this.styleContentElement.bind(this);
    this.createContentElement = this.createContentElement.bind(this);
    this.createNotesElement = this.createNotesElement.bind(this);
    this.configureElements = this.configureElements.bind(this);
    this.scaleBackgroundImage = this.scaleBackgroundImage.bind(this);
    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);

    this.configureElements();
    this.updateDimensions();

    this.events.on('propertiesChanged', (changes) => {
      if (changes.hasOwnProperty('ratio')) {
        this.updateDimensions();
      }
    });
  }

  updateDimensions() {
    let dimensions = this.scaler.dimensions;

    this.scalingElement.style.width = dimensions.width + 'px';
    this.scalingElement.style.height = dimensions.height + 'px';
  }

  scale(containerElement) {
    this.scaler.scaleToFit(this.scalingElement, containerElement);
  }

  show() {
    addClass(this.containerElement, 'remark-visible');
    removeClass(this.containerElement, 'remark-prev');
    removeClass(this.containerElement, 'remark-next');
  }

  hide() {
    removeClass(this.containerElement, 'remark-visible');
  }

  createSlideElement() {
    let element = document.createElement('div');
    element.className = 'remark-slide';

    if (this.slide.properties.continued === 'true') {
      addClass(element, 'remark-slide-incremental');
    }

    return element;
  }
  
  styleContentElement(element, properties) {
    element.className = '';

    const  setClassFromProperties = (element, properties) => {
      addClass(element, 'remark-slide-content');

      (properties['class'] || '').split(/[, ]/)
        .filter((s) => (s !== ''))
        .forEach((c) => { addClass(element, c); });
    };

    setClassFromProperties(element, properties);

    const setHighlightStyleFromProperties = (element, properties, slideShow) => {
      let highlightStyle = properties['highlight-style'] || slideShow.getOptions().highlightStyle;

      if (highlightStyle) {
        addClass(element, 'hljs-' + highlightStyle);
      }
    };

    setHighlightStyleFromProperties(element, properties, this.slideShow);

    const setBackgroundFromProperties = (element, properties) => {
      let backgroundProperties = ['background-image', 'background-color', 'background-size', 'background-position'];

      for (let i = 0; i < backgroundProperties.length; i++) {
        let property = backgroundProperties[i];

        if (properties[property]) {
          let elementProperty = property.replace(/([^-]+)-(.)(.*)/, (full, a, b, c) => (a + b.toUpperCase() + c));
          element.style[elementProperty] = properties[property];
        }
      }
    };

    setBackgroundFromProperties(element, properties);
  }

  createContentElement() {
    let element = document.createElement('div');

    if (this.slide.properties.name) {
      element.id = 'slide-' + this.slide.properties.name;
    }

    this.styleContentElement(element, this.slide.properties);
    element.innerHTML = this.converter.convertMarkdown(this.slide.content, this.slideShow.getLinks());
    this.codeBlockHighlighter.highlightCodeBlocks(element, this.slideShow);

    return element;
  }

  createNotesElement(notes) {
    let element = document.createElement('div');
    element.className = 'remark-slide-notes';
    element.innerHTML = this.converter.convertMarkdown(notes, this.slideShow.getLinks());

    this.codeBlockHighlighter.highlightCodeBlocks(element, this.slideShow);

    return element;
  }

  configureElements() {
    this.containerElement = document.createElement('div');
    this.containerElement.className = 'remark-slide-container';

    this.scalingElement = document.createElement('div');
    this.scalingElement.className = 'remark-slide-scaler';

    this.element = this.createSlideElement();

    this.contentElement = this.createContentElement(this.events, this.slideShow, this.slide);
    this.notesElement = this.createNotesElement(this.slideShow, this.slide.notes);


    let currentSlideNumber = this.slide.getSlideIndex();
    let slides = this.slideShow.getSlides();
    let nextSlideIncrement = currentSlideNumber+1 < slides.length ?
      slides[currentSlideNumber+1].properties.continued === 'true' : false;

    if (this.slide.properties.continued === 'true') {
      let classToAdd = nextSlideIncrement ? 'remark-slide-increment' : 'remark-slide-end-increment';
      addClass(this.containerElement, classToAdd);
    } else if (nextSlideIncrement) {
      addClass(this.containerElement, 'remark-slide-start-increment');
    }

    let options = this.slideShow.getOptions();

    if (options.slideNumber) {
      this.contentElement.appendChild(this.slideNumber.element);
    }

    this.element.appendChild(this.contentElement);
    this.scalingElement.appendChild(this.element);
    this.containerElement.appendChild(this.scalingElement);
    this.containerElement.appendChild(this.notesElement);
  }

  scaleBackgroundImage(dimensions) {
    let styles = window.getComputedStyle(this.contentElement);
    let backgroundImage = styles.backgroundImage;
    let backgroundSize = styles.backgroundSize;
    let backgroundPosition = styles.backgroundPosition;

    // If the user explicitly sets the backgroundSize or backgroundPosition, let
    // that win and early return here.
    if ((backgroundSize || backgroundPosition) && !this.backgroundSizeSet) {
      return;
    }

    let match = /^url\(("?)([^)]+?)\1\)/.exec(backgroundImage);

    if (match !== null) {
      let image = new Image();

      image.onload = () => {
        if (!this.originalBackgroundSize &&
            (image.width > dimensions.width || image.height > dimensions.height)
        ) {
          // Background image is larger than slide
          // No custom background size has been set
          this.originalBackgroundSize = this.contentElement.style.backgroundSize;
          this.originalBackgroundPosition = this.contentElement.style.backgroundPosition;
          this.backgroundSizeSet = true;
          let scale;

          if (dimensions.width / image.width < dimensions.height / image.height) {
            scale = dimensions.width / image.width;
          } else {
            scale = dimensions.height / image.height;
          }

          this.contentElement.style.backgroundSize = image.width * scale + 'px '+ image.height * scale + 'px';
          this.contentElement.style.backgroundPosition = '50% ' +
            ((dimensions.height - (image.height * scale)) / 2) + 'px';
        } else if (this.backgroundSizeSet) { // Revert to previous background size setting
          this.contentElement.style.backgroundSize = this.originalBackgroundSize;
          this.contentElement.style.backgroundPosition = this.originalBackgroundPosition;
          this.backgroundSizeSet = false;
        }
      };

      image.src = match[2];
    }
  }

  static setPrevNextClasses(element, next) {
    let names = ['prev', 'next'];

    if (next) {
      names = names.reverse();
    }

    addClass(element, 'remark-' + names[0]);
    removeClass(element, 'remark-visible');
    removeClass(element, 'remark-' + names[1]);
  }

  prev() {
    this.constructor.setPrevNextClasses(this.containerElement, false);
  }

  next() {
    this.constructor.setPrevNextClasses(this.containerElement, true);
  }
}