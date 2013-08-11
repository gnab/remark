(function (context) {

  var slideshow = createSlideshow(),
      editor = createEditor(slideshow);

  slideshow.loadFromString(editor.getValue());

  $('#choose').click(function () {
    Dropbox.choose({
      success: function (files) {
        var url = files[0].link;
        $.get(url)
          .success(function (data) {
            editor.setValue(data);
          })
          .fail(function () {
            // Download failed
          });
      },
      cancel: function () {
      },
      linkType: 'direct',
      multiselect: false
    });
  });

  function createEditor(slideshow) {
    var editor = ace.edit("editor");

    editor.setTheme("ace/theme/textmate");
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

}(this));
