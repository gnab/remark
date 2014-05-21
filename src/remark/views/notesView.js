var converter = require('../converter');

module.exports = NotesView;

function NotesView (events, element, slideViewsAccessor) {
  var self = this;

  self.events = events;
  self.element = element;
  self.slideViewsAccessor = slideViewsAccessor;

  self.configureElements();

  events.on('showSlide', function (slideIndex) {
    self.showSlide(slideIndex);
  });
}

NotesView.prototype.showSlide = function (slideIndex) {
  var self = this
    , slideViews = self.slideViewsAccessor()
    , slideView = slideViews[slideIndex]
    , nextSlideView = slideViews[slideIndex + 1]
    ;

  self.notesElement.innerHTML = slideView.notesElement.innerHTML;

  if (nextSlideView) {
    self.notesPreviewElement.innerHTML = nextSlideView.notesElement.innerHTML;
  }
  else {
    self.notesPreviewElement.innerHTML = '';
  }
};

NotesView.prototype.configureElements = function () {
  var self = this;

  self.notesElement = self.element.getElementsByClassName('remark-notes')[0];
  self.notesPreviewElement = self.element.getElementsByClassName('remark-notes-preview')[0];

  self.notesElement.addEventListener('mousewheel', function (event) {
    event.stopPropagation();
  });

  self.notesPreviewElement.addEventListener('mousewheel', function (event) {
    event.stopPropagation();
  });

  self.toolbarElement = self.element.getElementsByClassName('remark-toolbar')[0];

  var commands = {
    increase: function () {
      self.notesElement.style.fontSize = (parseFloat(self.notesElement.style.fontSize) || 1) + 0.1 + 'em';
      self.notesPreviewElement.style.fontsize = self.notesElement.style.fontSize;
    },
    decrease: function () {
      self.notesElement.style.fontSize = (parseFloat(self.notesElement.style.fontSize) || 1) - 0.1 + 'em';
      self.notesPreviewElement.style.fontsize = self.notesElement.style.fontSize;
    }
  };

  self.toolbarElement.getElementsByTagName('a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var command = e.target.hash.substr(1);
      commands[command]();
      e.preventDefault();
    });
  });
};
