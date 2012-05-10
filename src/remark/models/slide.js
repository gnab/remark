exports.Slide = Slide;

function Slide (source, previousSlide) {
  this.properties = {};
  this.source = extractProperties(source, this.properties);

  inheritProperties(this, previousSlide);
  inheritSource(this, previousSlide);
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

function inheritProperties (slide, previousSlide) {
  var property;

  if (shouldInheritPreviousSlide(slide, previousSlide)) {
    for (property in previousSlide.properties) {
      if (!previousSlide.properties.hasOwnProperty(property)) {
        continue;
      }

      if (slide.properties[property] === undefined) {
        slide.properties[property] = previousSlide.properties[property];
      }
    }
  }
}

function inheritSource (slide, previousSlide) {
  if (shouldInheritPreviousSlide(slide, previousSlide)) {
    slide.source = previousSlide.source + '\n' + slide.source;
  }
}

function shouldInheritPreviousSlide (slide, previousSlide) {
  return slide.properties['continue'] === 'true' && previousSlide;
}
