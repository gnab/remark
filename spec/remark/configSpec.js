buster.spec.expose();

describe('config', function () {
  it('should allow configuring by calling remark.config function', function () {
    remark.config({property: 'value'});

    expect(remark.config.property).toEqual('value');
  });

  it('should expose config function', function () {
    expect(remark.exports.config).toEqual(remark.config);
  });
});
