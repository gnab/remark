exports.Slide = Slide;

function Slide (source, previousSlide, namedSlides) {
  this.properties = {};
  this.source = extractProperties(source, this.properties);

  inheritSlide(this, previousSlide, namedSlides);
}

function extractProperties (source, properties) {
  var propertyFinder =
    /^\n*([^:$\n]+):([^$\n]*)/i
    , match
    ;

  while ((match = propertyFinder.exec(source)) !== null) {
    source = source.substr(0, match.index) +
      source.substr(match.index + match[0].length);

    properties[match[1].trim()] = match[2].trim();

    propertyFinder.lastIndex = match.index;
  }

  return source;
}

function inheritSlide (slide, previousSlide, namedSlides) {
  var slideToInherit = getSlideToInherit(slide, previousSlide, namedSlides);

  if (slideToInherit) {
    inheritProperties(slide, slideToInherit);
    inheritSource(slide, slideToInherit);
  }
}

function getSlideToInherit (slide, previousSlide, namedSlides) {
  return (slide.properties.continued === 'true' && previousSlide) ||
     (namedSlides && namedSlides[slide.properties['template']]);
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
  slide.source = slideToInherit.source + slide.source;
}
