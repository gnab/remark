module.exports = Slide;

function Slide (number, slide, template) {
  var self = this;

  self.properties = slide.properties || {};
  self.source = slide.source || '';
  self.notes = slide.notes || '';
  self.number = function () {
    return number;
  };

  if (template) {
    inherit(self, template);
  }

  /**
   * Steps
   * =====
   */
  var callbacks = {
        setup: []
      , step: []
      }
    , stepIndex = -1
    , loopCount = 0
    ;

  self.setup = function (callback) {
    if (callback) {
      callbacks.setup.push(callback);
    }
    return self;
  };

  self.step = function (callback) {
    if (callback) {
      callbacks.step.push(callback);
    }
    return self;
  };

  self.loop = self.step;

  self.init = function () {
    if (stepIndex === -1) {
      self.rewind();
    }
  };

  self.rewind = function (options) {
    var initial = stepIndex === -1;

    if (options && options.onlyInitial && !initial) {
      return self;
    }

    stepIndex = 0;
    callbacks.setup.forEach(function (setupCallback) {
      setupCallback.call(self, initial);
    });

    return self;
  };

  self.forward = function () {
    self.init();

    if (stepIndex < callbacks.step.length) {
      var result = callbacks.step[stepIndex].call(self, loopCount);
      if (result === undefined || result === true) {
        stepIndex += 1;
        loopCount = 0;
      }
      else {
        loopCount += 1;
      }
      return true;
    }
    else {
      return false;
    }
  };

  self.backward = function () {
    self.init();

    if (stepIndex > 0) {
      self.rewind();
      return true;
    }

    return false;
  };
}

function inherit (slide, template) {
  inheritProperties(slide, template);
  inheritSource(slide, template);
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
    property === 'layout';
}

function inheritSource (slide, template) {
  var expandedVariables;

  slide.properties.content = slide.source;
  slide.source = template.source;

  expandedVariables = slide.expandVariables(/* contentOnly: */ true);

  if (expandedVariables.content === undefined) {
    slide.source += slide.properties.content;
  }

  delete slide.properties.content;
}

function inheritNotes (slide, template) {
  if (template.notes) {
    slide.notes = template.notes + '\n\n' + slide.notes;
  }
}

Slide.prototype.expandVariables = function (contentOnly) {
  var properties = this.properties
    , expandResult = {}
    ;

  this.source = this.source.replace(/(\\)?(\{\{([^\}\n]+)\}\})/g,
    function (match, escaped, unescapedMatch, property) {
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
    });

  return expandResult;
};
