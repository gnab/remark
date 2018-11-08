const REFERENCE_WIDTH = 908;
const REFERENCE_HEIGHT = 681;
const REFERENCE_RATIO = REFERENCE_WIDTH / REFERENCE_HEIGHT;

export default class Scaler {
  constructor(events, slideShow) {
    this.events = events;
    this.slideShow = slideShow;

    this.getRatio = this.getRatio.bind(this);
    this.getDimensions = this.getDimensions.bind(this);
    this.scaleToFit = this.scaleToFit.bind(this);

    this.ratio = this.getRatio(slideShow);
    this.dimensions = this.getDimensions(this.ratio);

    this.events.on('propertiesChanged', (changes) => {
      if (changes.hasOwnProperty('ratio')) {
        this.ratio = this.getRatio();
        this.dimensions = this.getDimensions();
      }
    });
  }

  getRatio() {
    let ratioComponents = this.slideShow.getOptions().ratio.split(':');
    let ratio = {
      width: parseInt(ratioComponents[0], 10),
      height: parseInt(ratioComponents[1], 10)
    };

    ratio.ratio = ratio.width / ratio.height;
    return ratio;
  }

  getDimensions() {
    return {
      width: Math.floor(REFERENCE_WIDTH / REFERENCE_RATIO * this.ratio.ratio),
      height: REFERENCE_HEIGHT
    };
  }

  scaleToFit(element, container) {
    let containerHeight = container.clientHeight;
    let containerWidth = container.clientWidth;
    let ratio = this.ratio;
    let dimensions = this.dimensions;
    let scale;

    if (containerWidth / ratio.width > containerHeight / ratio.height) {
      scale = containerHeight / dimensions.height;
    } else {
      scale = containerWidth / dimensions.width;
    }

    let scaledWidth = dimensions.width * scale;
    let scaledHeight = dimensions.height * scale;

    let left = (containerWidth - scaledWidth) / 2;
    let top = (containerHeight - scaledHeight) / 2;

    element.style['-webkit-transform'] = 'scale(' + scale + ')';
    element.style.MozTransform = 'scale(' + scale + ')';
    element.style.left = Math.max(left, 0) + 'px';
    element.style.top = Math.max(top, 0) + 'px';
  }
}
