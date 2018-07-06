import Dom from "../../Dom";

export default class Styler {
  static PREFIX = 'remark-';
  static PRINTER = 'printer';

  static getRemarkStylesheets() {
    let styles = {};
    let prefixRegEx = new RegExp('^' + Styler.PREFIX);

    for (let i = 0; i < document.styleSheets.length; ++i) {
      let title = document.styleSheets[i].title;

      if (title.test(prefixRegEx) === true) {
        styles[title] = document.styleSheets[i];
      }
    }

    return styles;
  }

  static styleExists(name) {
    return Styler.getRemarkStylesheets().hasOwnProperty(Styler.PREFIX + name);
  }

  static isValidUrl(string) {
    try {
      new URL(string);
    } catch (exception) {
      return false;
    }

    return true;
  }

  static addStyle(name, style) {
    let fullName = Styler.PREFIX + name;

    // Bail out if document has already been styled
    if (Styler.styleExists(name)) {
      return;
    }

    let headElement = document.getElementsByTagName('head')[0];
    let styleElement = Dom.createElement({
      elementType: 'style',
      type: 'text/css',
      title: fullName, // Set title in order to enable lookup
      ...(Styler.isValidUrl(style) ? {src: style} : {innerHTML: style}) // Set document styles
    });

    // Put element first to prevent overriding user styles
    headElement.insertBefore(styleElement, headElement.firstChild);
  }

  static cleanup() {
    let styleSheets = Styler.getRemarkStylesheets();

    styleSheets.forEach((style) => {
      style.remove();
    });
  }

  // Locates the CSS @page rule
  static getPageRule(stylesheet) {
    for (let i = 0; i < stylesheet.cssRules.length; ++i) {
      if (stylesheet.cssRules[i] instanceof window.CSSPageRule) {
        return stylesheet.cssRules[i];
      }
    }

    return null;
  }

  static setPageSize(size) {
    if (Styler.styleExists(Styler.PRINTER) === false) {
      Styler.addStyle(Styler.PRINTER, '@page {size: landscape;}');
    }

    let styleSheets = Styler.getRemarkStylesheets();
    let fullName = Styler.PREFIX + Styler.PRINTER;

    if (styleSheets.hasOwnProperty(fullName)) {
      let pageRule = Styler.getPageRule(styleSheets[fullName]);

      if (pageRule !== null) {
        pageRule.style.size = size;
      }
    }
  }
}