buster.spec.expose();

describe('highlighter', function () {
  it('should return default CSS if style is not set', function () {
    remark.config({highlightStyle: undefined});

    expect(remark.highlighter.cssForStyle())
      .toEqual('/* bundle "vendor/highlight/styles/default.css" */');
  });

  it('should return empty CSS if style is set to null', function () {
    remark.config({highlightStyle: null});

    expect(remark.highlighter.cssForStyle()).toEqual('');
  });

  it('should expose engine via function', function () {
    hljs = {};

    expect(remark.exports.highlighter.engine()).toEqual(hljs);
  });
});
