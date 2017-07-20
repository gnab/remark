# remark

[![Build Status](https://travis-ci.org/gnab/remark.svg?branch=develop)](https://travis-ci.org/gnab/remark)
[![CDNJS](https://img.shields.io/cdnjs/v/remark.svg)](https://cdnjs.com/libraries/remark)
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4ADT275DY7JTG)

A simple, in-browser, markdown-driven slideshow tool targeted at people who know their way around HTML and CSS, featuring:

- Markdown formatting, with smart extensions
- Presenter mode with markdown formatted speaker notes and cloned slideshow view
- Syntax highlighting, supporting a range of languages
- Slide scaling, thus similar appearance on all devices / resolutions
- Simple markdown templates for customized slides
- Touch support for smart phones and pads, i.e. swipe to navigate slides

Check out [this remark slideshow](http://gnab.github.com/remark) for a brief introduction.

To render your Markdown-based slideshow on the fly, checkout [Remarkise](https://gnab.github.io/remark/remarkise).

### Getting Started

It takes only a few, simple steps to get up and running with remark:

1. Create an HTML file to contain your slideshow (see boilerplate below)
2. Open the HTML file in a decent browser
3. Edit the Markdown and/or CSS styles as needed, save and refresh!
4. Press C to clone a display; then press P to switch to presenter mode

See any of the boilerplate-*.html files, or just copy the boilerplate HTML below to start:

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
    <script src="https://remarkjs.com/downloads/remark-latest.min.js">
    </script>
    <script>
      var slideshow = remark.create();
    </script>
  </body>
</html>
```

### How To Use remark

The [wiki](http://github.com/gnab/remark/wiki) pages contain all the how-to, templating, and API help.

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
- [Lecture notes using remark](http://keysan.me/ee361/)
- [Big Data in Time - Progress and Challenges from Oceanography](http://www.jmlilly.net/talks/bigdata16.html)

### Other systems integrating with remark

- [http://platon.io](http://platon.io)
- [Remarkymark (Remark.js in Middleman)](https://github.com/camerond/remarkymark)
- [Remark Boilerplate](https://github.com/brenopolanski/remark-boilerplate)
- [Repositorium](https://github.com/pille1842/repositorium)
- [Backslide](https://github.com/sinedied/backslide) - CLI for automating creation, export and PDF conversion of Remark presentations
- [Remarker](https://github.com/kt3k/remarker) - CLI for serving and building Remark slideshow from markdown file

### Printing

Converting to PDF is primarily supported via Chrome's Print to PDF feature. Note that the styling is not exact; See [#50](https://github.com/gnab/remark/issues/50#issuecomment-223887379) for some recommended CSS to add to your styles.

Alternatively, you can use [DeckTape](https://github.com/astefanutti/decktape), a PDF exporter for HTML presentation frameworks that provides support for remark.

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
