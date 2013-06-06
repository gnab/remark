(function (context) {

  context.app = {
    load: function () {
      var pageHandler = pageHandlers[location.pathname];

      if (pageHandler) {
        pageHandler();
      }
    }
  };

  var pageHandlers = {
    '/home.html': function () {
      var slideshow = createSlideshow(),
          editor = createEditor(slideshow);

      slideshow.loadFromString(editor.getValue());
    },
    '/documentation.html': function () {

    }
  };

  function createEditor(slideshow) {
    var editor = ace.edit("editor");

    editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/markdown");
    editor.on('change', function(e) {
      slideshow.loadFromString(editor.getValue());
    });

    return editor;
  }

  function createSlideshow() {
    var slideshow = remark.create({
      container: document.getElementById('slideshow')
    });

    return slideshow;
  }

  // Downloads
  //app.downloads = (function () {
    //var filesUrl = 'https://api.github.com/repos/gnab/remark/contents/downloads?ref=gh-pages&callback=?',
      //historyUrl = 'https://api.github.com/repos/gnab/remark/contents/HISTORY.md?callback=?',
      //files = ko.observableArray(),
      //history = ko.observable(),
      //items = ko.computed(createItems);

    //function fetch () {
      //$.getJSON(filesUrl, function (result, status) {
        //if (status === "success") {
          //files(result.data.reverse());
        //}
      //});
      //$.getJSON(historyUrl, function (result, status) {
        //if (status === "success") {
          //var text = decodeBase64(result.data.content.replace(/\n/g, '')),
            //entries = text.split(/\n*### ([^\n]+)\n+/).slice(1);

          //history(entries);
        //}
      //});
    //}

    //function decodeBase64 (data) {
      //return atob && atob(data) || '';
    //}

    //function createItems() {
      //if (files().length === 0 || history() === undefined) {
        //return [];
      //}

      //return files();
    //}

    //return {
      //fetch: fetch,
      //items: items,
      //history: history
    //};
  //}());

}(this));
