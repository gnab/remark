# remark

[![Build Status](https://travis-ci.org/gnab/remark.svg?branch=develop)](https://travis-ci.org/gnab/remark)
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4ADT275DY7JTG)

A simple, in-browser, markdown-driven slideshow tool targeted at people who know their way around HTML and CSS, featuring:

- Markdown formatting, with smart extensions
- Presenter mode, with cloned slideshow view
- Syntax highlighting, supporting a range of languages
- Slide scaling, thus similar appearance on all devices / resolutions
- Touch support for smart phones and pads, i.e. swipe to navigate slides

Check out [this remark slideshow](http://gnab.github.com/remark) for a brief introduction.

To render your Markdown-based slideshow on the fly, checkout [Remarkise](https://gnab.github.io/remark/remarkise).

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
    <meta charset="utf-8">
    <style>
      @import url(https://fonts.googleapis.com/css?family=Yanone+Kaffeesatz);
      @import url(https://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic);
      @import url(https://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700,400italic);

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
    <script src="https://gnab.github.io/remark/downloads/remark-latest.min.js">
    </script>
    <script>
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

- [http://platon.io](http://platon.io)
- [http://markdowner.com](http://markdowner.com)
- [http://remarks.sinaapp.com](http://remarks.sinaapp.com/)
- [Remarkymark (Remark.js in Middleman)](https://github.com/camerond/remarkymark)

### Contributors

- [kjbekkelund](https://github.com/kjbekkelund)
- [DanTup](https://github.com/DanTup)
- [freakboy3742](https://github.com/freakboy3742)
- [nanoant](https://github.com/nanoant)
- [gurjeet](https://github.com/gurjeet)
- [torgeir](https://github.com/torgeir)
- [junderhill](https://github.com/junderhill)
- [gureckis](https://github.com/gureckis)
- [hfukada](https://github.com/hfukada)
- [danielstankiewicz](https://github.com/danielstankiewicz)
- [andrewgaul](https://github.com/andrewgaul)
- [tripu](https://github.com/tripu)
- [kud](https://github.com/kud)
- [toenuff](https://github.com/toenuff)
- [obfusk](https://github.com/obfusk)
- [trumbitta](https://github.com/trumbitta)
- [peter50216](https://github.com/peter50216)
- [mhor](https://github.com/mhor)
- [roberto](https://github.com/roberto)
- [camerond](https://github.com/camerond)
- [avdv](https://github.com/avdv)
- [WouterSioen](https://github.com/WouterSioen)
- [tchajed](https://github.com/tchajed)
- [venthur](https://github.com/venthur)
- [mathiasbynens](https://github.com/mathiasbynens)
- [aminb](https://github.com/aminb)
- [sol](https://github.com/sol)

### License

remark is licensed under the MIT license. See LICENSE for further
details.
