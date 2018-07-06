import Timer from "../components/Timer/Timer";
import {addClass} from "../utils";
import Dom from "../Dom";

export default class NotesView {
  constructor(events, slideViewsAccessor) {
    this.events = events;
    this.slideViewsAccessor = slideViewsAccessor;

    this.showSlide = this.showSlide.bind(this);
    this.createToolbar = this.createToolbar.bind(this);
    this.createToolbarButton = this.createToolbarButton.bind(this);
    this.createTimer = this.createTimer.bind(this);
    this.configureElement = this.configureElement.bind(this);
    this.configureElement();

    this.events.on('showSlide', (slideIndex) => {
      this.showSlide(slideIndex);
    });
  }
  
  showSlide(slideIndex) {
    let slideViews = this.slideViewsAccessor();
    let slideView = slideViews[slideIndex];
    let nextSlideView = slideViews[slideIndex + 1];
    this.notesElement.innerHTML = slideView.notesElement.innerHTML;

    if (nextSlideView) {
      this.notesPreviewElement.innerHTML = nextSlideView.notesElement.innerHTML;
    } else {
      this.notesPreviewElement.innerHTML = '';
    }
  }

  createToolbarButton(decrease) {
    decrease = decrease || false;

    let button = Dom.createElement({
      elementType: 'a',
      className: 'remark-toolbar__link',
      innerHTML: decrease ? '-' : '+'
    });

    button.addEventListener('click', (e) => {
      let currentFontSize = parseFloat(this.notesElement.style.fontSize) || 1;
      this.notesElement.style.fontSize = (currentFontSize + (decrease ? -0.1 : 0.1)) + 'em';
      this.notesPreviewElement.style.fontSize = this.notesElement.style.fontSize;
      e.preventDefault();
    });

    return button;
  }

  createTimer() {
    let timerElement = Dom.createElement({elementType: 'span', className: 'remark-toolbar__timer'});
    new Timer(this.events, timerElement);

    return timerElement;
  }

  createToolbar() {
    return Dom.createElement(
      {className: 'remark-toolbar'},
      [this.createToolbarButton(), this.createToolbarButton(true), this.createTimer()]
    );
  }

  static createNotesContainer(preview) {
    preview = preview || false;

    let head = Dom.createElement({
      className: 'remark-notes__head',
      innerHTML: preview ? 'Notes for next slide' : 'Notes for current slide'
    });

    let content = Dom.createElement({className: 'remark-notes__content'});

    let notesContainer = Dom.createElement(
      {className: 'remark-notes'},
      [head, content]
    );
    addClass(notesContainer, preview ? 'remark-notes--preview' : 'remark-notes--current');
    return notesContainer;
  }

  static createArea(classExtra, appends) {
    return Dom.createElement(
      {className: 'remark-notes-area__' + classExtra},
      appends
    );
  }

  configureElement() {
    this.toolbarElement = this.createToolbar();

    let currentNotes = this.constructor.createNotesContainer();
    this.notesElement = currentNotes.getElementsByClassName('remark-notes__content')[0];
    this.notesElement.addEventListener('mousewheel', (event) => {event.stopPropagation();});

    let previewNotes = this.constructor.createNotesContainer(true);
    this.notesPreviewElement = previewNotes.getElementsByClassName('remark-notes__content')[0];
    this.notesPreviewElement.addEventListener('mousewheel', (event) => {event.stopPropagation();});

    this.element = Dom.createElement(
      {className: 'remark-notes-area'},
      [
        this.constructor.createArea('top', [this.toolbarElement]),
        this.constructor.createArea('bottom', [currentNotes, previewNotes])
      ]
    );
  }
}
