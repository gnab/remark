# remark

[![](https://api.travis-ci.org/gnab/remark.svg?branch=master)](https://travis-ci.org/gnab/remark)

A simple, in-browser, markdown-driven slideshow tool targeted at people who know their way around HTML and CSS, featuring:

- Markdown formatting, with smart extensions
- Presenter mode, with cloned slideshow view
- Syntax highlighting, supporting a range of languages
- Slide scaling, thus similar appearance on all devices / resolutions
- Touch support for smart phones and pads, i.e. swipe to navigate slides

Check out [this remark slideshow](http://gnab.github.com/remark) for a brief introduction.

### Getting Started

It takes only a few, simple steps to get up and running with remark:

1. Create a HTML file to contain your slideshow (see below)
2. Open the HTML file in a decent browser
3. Edit the Markdown and/or CSS styles as needed, save and refresh!

Below is a boilerplate HTML file to get you started:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Title</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <style type="text/css">
      @import url(http://fonts.googleapis.com/css?family=Yanone+Kaffeesatz);
      @import url(http://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic);
      @import url(http://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700,400italic);

      body { font-family: 'Droid Serif'; }
      h1, h2, h3 {
        font-family: 'Yanone Kaffeesatz';
        font-weight: normal;
      }
      .remark-code, .remark-inline-code { font-family: 'Ubuntu Mono'; }
    </style>
  </head>
  <body>
    <textarea id="source">

class: center, middle

# Title

---

# Agenda

1. Introduction
2. Deep-dive
3. ...

---

# Introduction

    </textarea>
    <script src="http://gnab.github.io/remark/downloads/remark-latest.min.js" type="text/javascript">
    </script>
    <script type="text/javascript">
      var slideshow = remark.create();
    </script>
  </body>
</html>
```

### Moving On

For more information on using remark, please check out the [wiki](http://github.com/gnab/remark/wiki) pages.

### Real-world remark slideshows

On using remark:

- [The Official remark Slideshow](http://gnab.github.com/remark)
- [Coloured Terminal Listings in remark](http://joshbode.github.com/remark/ansi.html) by [joshbode](https://github.com/joshbode)

Other interesting stuff:

- [gnab.github.com/editorjs](http://gnab.github.com/editorjs)
- [judoole.github.com/GroovyBDD](http://judoole.github.com/GroovyBDD)
- [kjbekkelund.github.com/nith-coffeescript](http://kjbekkelund.github.com/nith-coffeescript)
- [kjbekkelund.github.com/js-architecture-backbone](http://kjbekkelund.github.com/js-architecture-backbone)
- [bekkopen.github.com/infrastruktur-som-kode](http://bekkopen.github.com/infrastruktur-som-kode)
- [ivarconr.github.com/Test-Driven-Web-Development/slides](http://ivarconr.github.com/Test-Driven-Web-Development/slides)
- [havard.github.com/node.js-intro-norwegian](http://havard.github.com/node.js-intro-norwegian)
- [mobmad.github.com/js-tdd-erfaringer](http://mobmad.github.com/js-tdd-erfaringer)
- [torgeir.github.com/busterjs-lightning-talk](http://torgeir.github.com/busterjs-lightning-talk)
- [roberto.github.com/ruby-sinform-2012](http://roberto.github.com/ruby-sinform-2012)
- [http://asmeurer.github.io/python3-presentation/slides.html](http://asmeurer.github.io/python3-presentation/slides.html)

### Other systems integrating with remark

- [http://markdowner.com](http://markdowner.com)
- [http://remarks.sinaapp.com](http://remarks.sinaapp.com/)

### Credits

- [torgeir](http://github.com/torgeir), for invaluable advice and feedback.
- [kjbekkelund](https://github.com/kjbekkelund), for numerous pull requests.
- [gureckis](https://github.com/gureckis), for several pull requests.
- [freakboy3742](https://github.com/freakboy3742), for several pull requests.

### License

remark is licensed under the MIT license. See LICENCE for further
details.
