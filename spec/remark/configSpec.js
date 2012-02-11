describe('config', function () {
  it('should allow configuring by calling remark.config function', function () {
    remark.config({property: 'value'});

    expect(remark.config.property).toBe('value');
  });
});
