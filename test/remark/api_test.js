var sinon = require('sinon')
  , api = require('../../src/remark/api')
  , highlighter = require('../../src/remark/highlighter')
  , Slideshow = require('../../src/remark/models/slideshow')
  , utils = require('../../src/remark/utils')
  ;

describe('API', function () {
  it('should be exposed', function () {
    window.should.have.property('remark');
  });

  it('should expose highlighter', function () {
    api.highlighter.should.equal(highlighter);
  });

  it('should allow creating slideshow', function () {
    var html = document.createElement('html');
    var body = document.createElement('body');

    // Stub to prevent altering test runner DOM
    sinon.stub(utils, 'getHTMLElement').returns(html);
    sinon.stub(utils, 'getBodyElement').returns(body);
    sinon.stub(utils, 'setLocationHash');

    api.create().should.be.an.instanceOf(Slideshow);

    utils.getHTMLElement.restore();
    utils.getBodyElement.restore();
    utils.setLocationHash.restore();
  });

  it('should allow creating slideshow with source directly', function () {
    var html = document.createElement('html');
    var body = document.createElement('body');
    
    // Stub to prevent altering test runner DOM
    sinon.stub(utils, 'getHTMLElement').returns(html);
    sinon.stub(utils, 'getBodyElement').returns(body);
    sinon.stub(utils, 'setLocationHash');

    var slides = api.create({ source: '1\n---\n2' }).getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql([ '1' ]);
    slides[1].content.should.eql([ '2' ]);

    utils.getHTMLElement.restore();
    utils.getBodyElement.restore();
    utils.setLocationHash.restore();
  });

  it('should allow creating slideshow from source textarea', function () {
    var html = document.createElement('html');
    var body = document.createElement('body');

    // Stub to prevent altering test runner DOM
    sinon.stub(utils, 'getHTMLElement').returns(html);
    sinon.stub(utils, 'getBodyElement').returns(body);
    sinon.stub(utils, 'setLocationHash');

    // Create a textarea in the document for the test to read from
    var source = document.createElement('textarea');
    source.id = 'source';
    source.textContent = '3\n---\n4';
    document.body.appendChild(source);
    
    var slides = api.create().getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql(['3']);
    slides[1].content.should.eql(['4']);

    utils.getHTMLElement.restore();
    utils.getBodyElement.restore();
    utils.setLocationHash.restore();
    document.body.removeChild(source);
  });

  it('should allow creating slideshow from source url with linux newlines', function () {
  	var html = document.createElement('html');
  	var body = document.createElement('body');

  	// Stub to prevent altering test runner DOM
  	sinon.stub(utils, 'getHTMLElement').returns(html);
  	sinon.stub(utils, 'getBodyElement').returns(body);
  	sinon.stub(utils, 'setLocationHash');

  	var slides = api.create({ sourceUrl: 'test-slides-source-url-linux-newlines.txt' }).getSlides();
  	slides.length.should.eql(2);
  	slides[0].content.should.eql(['5']);
  	slides[1].content.should.eql(['6']);

  	utils.getHTMLElement.restore();
  	utils.getBodyElement.restore();
  	utils.setLocationHash.restore();
  });

  it('should allow creating slideshow from source url with windows newlines', function () {
    var html = document.createElement('html');
    var body = document.createElement('body');
    
    // Stub to prevent altering test runner DOM
    sinon.stub(utils, 'getHTMLElement').returns(html);
    sinon.stub(utils, 'getBodyElement').returns(body);
    sinon.stub(utils, 'setLocationHash');
    
    var slides = api.create({ sourceUrl: 'test-slides-source-url-windows-newlines.txt' }).getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql(['5']);
    slides[1].content.should.eql(['6']);
    
    utils.getHTMLElement.restore();
    utils.getBodyElement.restore();
    utils.setLocationHash.restore();
  });
});
