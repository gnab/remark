import { EventEmitter } from 'events';
import Styler from '../Styler/Styler';

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';
const PAGE_HEIGHT = 681;
const PAGE_WIDTH = 908;

export default class Printing extends EventEmitter {
  constructor() {
    super();

    this.orientation = LANDSCAPE;
    this.pageHeight = PAGE_HEIGHT;
    this.pageWidth = PAGE_WIDTH;

    this.onPrint = this.onPrint.bind(this);
    this.setPageOrientation = this.setPageOrientation.bind(this);

    if (window.matchMedia) {
      window.matchMedia('print').addListener((e) => {
        this.onPrint(e);
      });
    }
  }

  onPrint(e) {
    if (e.matches) {
      this.emit('print', {
        isPortrait: this.orientation === 'portrait',
        pageHeight: this.pageHeight,
        pageWidth: this.pageWidth
      });
    }
  };

  setPageOrientation(orientation) {
    if (orientation === PORTRAIT) {
      // Flip dimensions for portrait orientation
      this.pageHeight = PAGE_WIDTH;
      this.pageWidth = PAGE_HEIGHT;
    } else if (orientation === LANDSCAPE) {
      this.pageHeight = PAGE_HEIGHT;
      this.pageWidth = PAGE_WIDTH;
    } else {
      throw new Error('Unknown print orientation: ' + orientation);
    }

    this.orientation = orientation;

    Styler.setPageSize(this.pageWidth + 'px ' + this.pageHeight + 'px');
  };
}
