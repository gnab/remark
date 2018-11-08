const JSDOM = require('jsdom').JSDOM;
const polyfills = require('../../src/polyfills');

global.dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = global.window.navigator;

polyfills.apply();
