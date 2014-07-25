var resources = require('../../resources')
  , highlighter = require('../../highlighter')
  ;

module.exports = {
  styleDocument: styleDocument
};

// Global reference to style element, used to determine if
// document has been styled and to alter applied styles
var styleElement;

// Applies bundles styles to document, by inserting a
// <style> element as the first child of the <head> element.
function styleDocument () {
  var headElement, style;

  // Bail out if document has already been styled
  if (styleElement) {
    return;
  }

  headElement = document.getElementsByTagName('head')[0]
  styleElement = document.createElement('style')

  styleElement.type = 'text/css';
  headElement.insertBefore(styleElement, headElement.firstChild);

  styleElement.innerHTML = resources.documentStyles;

  for (style in highlighter.styles) {
    if (highlighter.styles.hasOwnProperty(style)) {
      styleElement.innerHTML = styleElement.innerHTML +
        highlighter.styles[style];
    }
  }
}
