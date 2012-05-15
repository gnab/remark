exports.Slide = Slide;

function Slide (source, previousSlide, namedSlides) {
  this.properties = {};
  this.source = extractProperties(source, this.properties);

  inheritTemplate(this, previousSlide, namedSlides);
}

function extractProperties (source, properties) {
  var propertyFinder = /^\n*([^:$\n]+):([^$\n]*)/i
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

function inheritTemplate (slide, previousSlide, namedSlides) {
  var template = getTemplate(slide, previousSlide, namedSlides);

  if (template) {
    inheritProperties(slide, template);
    inheritSource(slide, template);
  }
}

function getTemplate (slide, previousSlide, namedSlides) {
  return (slide.properties.continued === 'true' && previousSlide) ||
     (namedSlides && namedSlides[slide.properties.template]);
}

function inheritProperties (slide, template) {
  var property;

  for (property in template.properties) {
    if (!template.properties.hasOwnProperty(property) ||
        ignoreProperty(property)) {
      continue;
    }

    if (slide.properties[property] === undefined) {
      slide.properties[property] = template.properties[property];
    }
  }
}

function ignoreProperty (property) {
  return property === 'name' ;
}

function inheritSource (slide, template) {
  slide.source = template.source + slide.source;
}
