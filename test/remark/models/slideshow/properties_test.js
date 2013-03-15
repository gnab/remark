var EventEmitter = require('events').EventEmitter
  , Properties = require('../../../../src/remark/models/slideshow/properties')
  ;

describe('properties', function () {
  var events
    , properties
    ;

  beforeEach(function () {
    events = new EventEmitter();
    properties = new Properties(events);
  });

  it('should allow setting and getting properties', function () {
    properties.set({highlightStyle: 'some-style'});

    properties.get('highlightStyle').should.equal('some-style');
  });

  it('should notify when set', function (done) {
    events.once('propertiesChanged', function (changes) {
      done();
    });
    properties.set({ratio: '16:9'});
  });
});
