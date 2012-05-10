exports.Slide = Slide;

function Slide (source) {
  this.properties = {};
  this.source = extractProperties(source, this.properties);
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
