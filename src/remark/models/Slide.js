export default class Slide {
  constructor(slideIndex, slideNumber, slide, template) {
    this.slideIndex = slideIndex;
    this.slideNumber = slideNumber;
    this.properties = slide.properties || {};
    this.links = slide.links || {};
    this.content = slide.content || [];
    this.notes = slide.notes || '';

    this.getSlideIndex = this.getSlideIndex.bind(this);
    this.getSlideNumber = this.getSlideNumber.bind(this);
    this.inherit = this.inherit.bind(this);
    this.inheritProperties = this.inheritProperties.bind(this);

    if (template) {
      this.inherit(template);
    }
  }

  getSlideIndex() {
    return this.slideIndex;
  }

  getSlideNumber() {
    return this.slideNumber;
  }

  inherit(template) {
    this.inheritProperties(template);
    this.inheritContent(template);
    this.inheritNotes(template);
  }


  inheritProperties(template) {
    let ignoredProperties = ['name', 'layout', 'count'];

    for (let property in template.properties) {
      if (!template.properties.hasOwnProperty(property)
          || ignoredProperties.indexOf(property) !== -1
      ) {
        continue;
      }

      let value = [template.properties[property]];

      if (property === 'class' && this.properties[property]) {
        value.push(this.properties[property]);
      }

      if (property === 'class' || this.properties[property] === undefined) {
        this.properties[property] = value.join(', ');
      }
    }
  }

  inheritContent(template) {
    this.properties.content = this.content.slice();

    const deepCopyContent = (target, content) => {
      target.content = [];

      for (let i = 0; i < content.length; ++i) {
        if (typeof content[i] === 'string') {
          target.content.push(content[i]);
        } else {
          target.content.push({
            'block': content[i].block,
            'class': content[i].class,
          });

          deepCopyContent(
            target.content[target.content.length-1],
            content[i].content
          );
        }
      }
    };

    deepCopyContent(this, template.content);

    let expandedVariables = this.expandVariables(/* contentOnly: */ true);

    if (expandedVariables.content === undefined) {
      this.content = this.content.concat(this.properties.content);
    }

    delete this.properties.content;
  }

  inheritNotes(template) {
    if (template.notes) {
      this.notes = template.notes + '\n\n' + this.notes;
    }
  }

  expandVariables(contentOnly, content, expandResult) {
    content = content !== undefined ? content : this.content;
    expandResult = expandResult || {};

    const expand = (match, escaped, unescapedMatch, property) => {
      if (escaped) {
        return contentOnly ? match[0] : unescapedMatch;
      }

      let propertyName = property.trim();

      if (contentOnly && propertyName !== 'content') {
        return match;
      }

      let propertyValue = this.properties[propertyName];

      if (propertyValue !== undefined) {
        expandResult[propertyName] = propertyValue;
        return propertyValue;
      }

      return propertyName === 'content' ? '' : unescapedMatch;
    };

    for (let i = 0; i < content.length; ++i) {
      if (typeof content[i] === 'string') {
        content[i] = content[i].replace(/(\\)?({{([^}\n]+)}})/g, expand);
      } else {
        this.expandVariables(contentOnly, content[i].content, expandResult);
      }
    }

    return expandResult;
  }
}
