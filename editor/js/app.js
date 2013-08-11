(function (context) {

  var slideshow = createSlideshow(),
      editor = createEditor(slideshow);

  slideshow.loadFromString(editor.getValue());

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
