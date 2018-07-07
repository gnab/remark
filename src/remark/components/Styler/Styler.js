import Dom from "../../Dom";

export default class Styler {
  static PREFIX = 'remark-';
  static PRINTER = 'printer';

  static getRemarkStylesheets() {
    let styles = {};
    let prefixRegEx = new RegExp('^' + Styler.PREFIX + '.*');

    for (let i = 0; i < document.styleSheets.length; ++i) {
      let style = document.styleSheets[i];
      let title = style.ownerNode.getAttribute('component') + '';


      if (prefixRegEx.test(title) === true) {
        if (styles.hasOwnProperty(title) === false) {
          styles[title] = [];
        }

        styles[title].push(document.styleSheets[i]);
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
      type: 'text/css'
    });

    styleElement.setAttribute('component', fullName);

    if (Styler.isValidUrl(style) === true) {
      styleElement.setAttribute('src', style);
    } else {
      styleElement.innerHTML = style;
    }

    // Put element first to prevent overriding user styles
    headElement.insertBefore(styleElement, headElement.firstChild);
  }

  static cleanup() {
    let styleSheets = Styler.getRemarkStylesheets();

    for (let style in styleSheets) {
      if (styleSheets.hasOwnProperty(style)) {
        styleSheets[style].forEach((styleSheet) => {
          styleSheet.ownerNode.remove();
        });
      }
    }
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
      let pageRule = Styler.getPageRule(styleSheets[fullName][0]);

      if (pageRule !== null) {
        pageRule.style.size = size;
      }
    }
  }
}