(function () {
  /*global ko: true, Sammy: true, ace: true*/  
    
  var app = {};
    
  // Navigation
  app.router = Sammy(function() {
    this.get('#/(|download|documentation)', function (context, target) {
      $('[data-tab]')
        .each(function (i, tab) {
          var $tab = $(tab);
          
          if ($tab.attr('data-tab') === target) {
            $('ul.tabs a[href="#/' + target + '"]').parent().addClass('active');
            $tab.show();
          }
          else {
            $('ul.tabs a[href="#/' + $tab.attr('data-tab') + '"]').parent().removeClass('active');
            $tab.hide();
          }
        });
    });
  });
    
  // Downloads
  app.downloads = (function () {
    var filesUrl = 'https://api.github.com/repos/gnab/remark/contents/downloads?ref=gh-pages',
      historyUrl = 'https://api.github.com/repos/gnab/remark/contents/HISTORY.md',
      files = ko.observableArray(),
      history = ko.observable(),
      items = ko.computed(createItems);
    
    function fetch () {
      $.getJSON(filesUrl, function (result, status) {        
        if (status === "success") {
          files(result.reverse());
        }
      });
      $.getJSON(historyUrl, function (result, status) {        
        if (status === "success") {
          var text = decodeBase64(result.content.replace(/\n/g, '')),
            entries = text.split(/\n*### ([^\n]+)\n+/).slice(1);
          
          history(entries);
        }
      });
    }
    
    function decodeBase64 (data) {
      return atob && atob(data) || '';
    }
    
    function createItems() {
      if (files().length === 0 || history() === undefined) {
        return [];
      }
      
      return files();
    }
    
    return {
      fetch: fetch,
      items: items,
      history: history
    };
  }());
  
  // Editor
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setMode("ace/mode/markdown");  
  
  ko.applyBindings(app);
  app.router.run('#/');
  app.downloads.fetch();
  
}());