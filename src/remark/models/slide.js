exports.Slide = Slide;

function Slide (source, previousSlide, namedSlides) {
  this.properties = {};
  this.source = extractProperties(source, this.properties);

  inheritSlide(this, previousSlide, namedSlides);
}

function extractProperties (source, properties) {
  var propertyFinder =
    /^\n*((?:[a-z_\-][a-z\-_0-9]*)+)\s*:\s*([^$\n]*)\s*(?:$|\n)/i
    , match
    ;

  while ((match = propertyFinder.exec(source)) !== null) {
    source = source.substr(0, match.index) +
      source.substr(match.index + match[0].length);

    properties[match[1]] = match[2];

    propertyFinder.lastIndex = match.index;
  }

  return source;
}

function inheritSlide (slide, previousSlide, namedSlides) {
  var slideToInherit =
    shouldInheritPreviousSlide(slide, previousSlide) ||
    shouldInheritNamedSlide(slide, namedSlides);

  if (slideToInherit) {
    inheritProperties(slide, slideToInherit);
    inheritSource(slide, slideToInherit);
  }
}

function inheritProperties (slide, slideToInherit) {
  var property;

  for (property in slideToInherit.properties) {
    if (!slideToInherit.properties.hasOwnProperty(property) ||
        property === 'name') {
      continue;
    }

    if (slide.properties[property] === undefined) {
      slide.properties[property] = slideToInherit.properties[property];
    }
  }
}

function inheritSource (slide, slideToInherit) {
  slide.source = slideToInherit.source + '\n' + slide.source;
}

function shouldInheritPreviousSlide (slide, previousSlide) {
  return slide.properties['continue'] === 'true' && previousSlide;
}

function shouldInheritNamedSlide (slide, namedSlides) {
  return slide.properties['continue'] && namedSlides &&
    namedSlides[slide.properties['continue']];
}
