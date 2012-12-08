var config = require('../../src/remark/config')
  , api = require('../../src/remark/api')
  ;

describe('config', function () {
  it('should allow setting predefined property', function () {
    config({highlightStyle: 'some-style'});

    config.should.have.property('highlightStyle', 'some-style');
  });

  it('should disallow setting undefined properties', function () {
    config({undefinedProperty: 'some-value'});

    config.should.not.have.property('undefinedProperty');
  });

  it('should handle setting no properties', function () {
    (function () {
      config();
    }).should.not.throw();
  });

  it('should be exposed', function () {
    api.should.have.property('config', config);
  });
});
