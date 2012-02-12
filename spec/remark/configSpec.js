buster.spec.expose();

describe('config', function () {
  it('should allow setting predefined property', function () {
    remark.config({highlightStyle: 'some-style'});

    expect(remark.config.highlightStyle).toEqual('some-style');
  });

  it('should disallow setting undefined properties', function () {
    remark.config({undefinedProperty: 'some-value'});

    expect(remark.config.undefinedProperty).toEqual(undefined);
  });

  it('should be exposed', function () {
    expect(remark.exports.config).toEqual(remark.config);
  });
});
