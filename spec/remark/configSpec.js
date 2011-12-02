describe('config', function () {
  it('should allow configuring by calling remark.config function', function () {
    module.config({property: 'value'});

    expect(module.config.property).toBe('value');
  });
});
