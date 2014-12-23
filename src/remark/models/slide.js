module.exports = Slide;

function Slide (slideIndex, slide, template) {
  var self = this;

  self.properties = slide.properties || {};
  self.links = slide.links || {};
  self.content = slide.content || [];
  self.notes = slide.notes || '';

  self.getSlideIndex = function () { return slideIndex; };

  if (template) {
    inherit(self, template);
  }
}

function inherit (slide, template) {
  inheritProperties(slide, template);
  inheritContent(slide, template);
  inheritNotes(slide, template);
}

function inheritProperties (slide, template) {
  var property
    , value
    ;

  for (property in template.properties) {
    if (!template.properties.hasOwnProperty(property) ||
        ignoreProperty(property)) {
      continue;
    }

    value = [template.properties[property]];

    if (property === 'class' && slide.properties[property]) {
      value.push(slide.properties[property]);
    }

    if (property === 'class' || slide.properties[property] === undefined) {
      slide.properties[property] = value.join(', ');
    }
  }
}

function ignoreProperty (property) {
  return property === 'name' ||
    property === 'layout' ||
    property === 'count';
}

function inheritContent (slide, template) {
  var expandedVariables;

  slide.properties.content = slide.content.slice();
  slide.content = template.content.slice();

  expandedVariables = slide.expandVariables(/* contentOnly: */ true);

  if (expandedVariables.content === undefined) {
    slide.content = slide.content.concat(slide.properties.content);
  }

  delete slide.properties.content;
}

function inheritNotes (slide, template) {
  if (template.notes) {
    slide.notes = template.notes + '\n\n' + slide.notes;
  }
}

Slide.prototype.expandVariables = function (contentOnly, content, expandResult) {
  var properties = this.properties
    , i
    ;

  content = content !== undefined ? content : this.content;
  expandResult = expandResult || {};

  for (i = 0; i < content.length; ++i) {
    if (typeof content[i] === 'string') {
      content[i] = content[i].replace(/(\\)?(\{\{([^\}\n]+)\}\})/g, expand);
    }
    else {
      this.expandVariables(contentOnly, content[i].content, expandResult);
    }
  }

  function expand (match, escaped, unescapedMatch, property) {
    var propertyName = property.trim()
      , propertyValue
      ;

    if (escaped) {
      return contentOnly ? match[0] : unescapedMatch;
    }

    if (contentOnly && propertyName !== 'content') {
      return match;
    }

    propertyValue = properties[propertyName];

    if (propertyValue !== undefined) {
      expandResult[propertyName] = propertyValue;
      return propertyValue;
    }

    return propertyName === 'content' ? '' : unescapedMatch;
  }

  return expandResult;
};
