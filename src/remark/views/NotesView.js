export default class NotesView {
  constructor(events, element, slideViewsAccessor) {
    this.events = events;
    this.element = element;
    this.slideViewsAccessor = slideViewsAccessor;

    this.showSlide = this.showSlide.bind(this);
    this.configureElements = this.configureElements.bind(this);

    this.configureElements();

    events.on('showSlide', (slideIndex) => {
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
  
  configureElements() {
    this.notesElement = this.element.getElementsByClassName('remark-notes')[0];
    this.notesPreviewElement = this.element.getElementsByClassName('remark-notes-preview')[0];

    this.notesElement.addEventListener('mousewheel', (event) => {
      event.stopPropagation();
    });

    this.notesPreviewElement.addEventListener('mousewheel', (event) => {
      event.stopPropagation();
    });

    this.toolbarElement = this.element.getElementsByClassName('remark-toolbar')[0];

    let commands = {
      increase: () => {
        this.notesElement.style.fontSize = (parseFloat(this.notesElement.style.fontSize) || 1) + 0.1 + 'em';
        this.notesPreviewElement.style.fontSize = this.notesElement.style.fontSize;
      },
      decrease: () => {
        this.notesElement.style.fontSize = (parseFloat(this.notesElement.style.fontSize) || 1) - 0.1 + 'em';
        this.notesPreviewElement.style.fontSize = this.notesElement.style.fontSize;
      }
    };

    this.toolbarElement.getElementsByTagName('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        let command = e.target.hash.substr(1);
        commands[command]();
        e.preventDefault();
      });
    });
  }
}
