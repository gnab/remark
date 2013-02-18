var jsdom = require('jsdom').jsdom;

document = jsdom('<html><head></head><body></body></html>');
window = document.createWindow();
alert = window.alert;
