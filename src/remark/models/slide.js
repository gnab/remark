exports.Slide = Slide;

Slide.create = function (source, opts) {
  return new Slide(source, opts);
};

function Slide (source) {
  this.properties = {};
  this.source = extractProperties(source, this.properties);
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

Slide.prototype.inherit = function (template) {
  inheritProperties(this, template);
  inheritSource(this, template);
};

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
  return property === 'name' ||
    property === 'layout';
}

function inheritSource (slide, template) {
  slide.source = template.source + slide.source;
}

Slide.prototype.expandVariables = function () {
  var properties = this.properties;

  this.source = this.source.replace(/(\\)?(\{\{([^\}\n]+)\}\})/g,
    function (match, escaped, unescapedMatch, property) {
      return !escaped && properties[property.trim()] || unescapedMatch;
    });
};
