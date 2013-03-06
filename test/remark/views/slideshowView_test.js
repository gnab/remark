var SlideshowView = require('../../../src/remark/views/slideshowView').SlideshowView
  , Slideshow = require('../../../src/remark/models/slideshow').Slideshow
  , config = require('../../../src/remark/config')
  ;

describe('SlideshowView', function () {
  var model
    , container
    , view
    ;

  beforeEach(function () {
    model = new Slideshow('');
    container = document.createElement('div');
  });

  describe('ratio calculation', function () {
    it('should calculate element size for 4:3', function () {
      config.set({ratio: '4:3'});

      view = new SlideshowView(model, container);

      container.style.width.should.equal('908px');
      container.style.height.should.equal('681px');
    });

    it('should calculate element size for 16:9', function () {
      config.set({ratio: '16:9'});

      view = new SlideshowView(model, container);

      container.style.width.should.equal('1210px');
      container.style.height.should.equal('681px');
    });

    it('should recalculate element size when reconfigured', function () {
      config.set({ratio: '4:3'});

      view = new SlideshowView(model, container);

      config.set({ratio: '16:9'});

      container.style.width.should.equal('1210px');
      container.style.height.should.equal('681px');
    });
  });

  describe('model synchronization', function () {
    beforeEach(function () {
      view = new SlideshowView(model, container);
    });

    it('should create initial slide views', function () {
      container.getElementsByClassName('slide').length.should.equal(0);
    });

    it('should replace slide views on slideshow update', function () {

      model.loadFromString('a\n---\nb');

      container.getElementsByClassName('slide').length.should.equal(2);
    });
  });
});
