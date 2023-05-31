# remark

[![Build Status](https://travis-ci.org/gnab/remark.svg?branch=develop)](https://travis-ci.org/gnab/remark)
[![CDNJS](https://img.shields.io/cdnjs/v/remark.svg)](https://cdnjs.com/libraries/remark)
[![xscode](https://img.shields.io/badge/Available%20on-xs%3Acode-blue?style=?style=plastic&logo=appveyor&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////////VXz1bAAAAAJ0Uk5T/wDltzBKAAAAlUlEQVR42uzXSwqAMAwE0Mn9L+3Ggtgkk35QwcnSJo9S+yGwM9DCooCbgn4YrJ4CIPUcQF7/XSBbx2TEz4sAZ2q1RAECBAiYBlCtvwN+KiYAlG7UDGj59MViT9hOwEqAhYCtAsUZvL6I6W8c2wcbd+LIWSCHSTeSAAECngN4xxIDSK9f4B9t377Wd7H5Nt7/Xz8eAgwAvesLRjYYPuUAAAAASUVORK5CYII=)](https://xscode.com/gnab/remark)
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4ADT275DY7JTG)

A simple, in-browser, markdown-driven slideshow tool targeted at people who know their way around HTML and CSS, featuring:

- Markdown formatting, with smart extensions
- Presenter mode with markdown formatted speaker notes and cloned slideshow view
- Syntax highlighting, supporting a range of languages
- Slide scaling, thus similar appearance on all devices / resolutions
- Simple markdown templates for customized slides
- Touch support for smart phones and pads, i.e. swipe to navigate slides

Check out [this remark slideshow](https://remarkjs.com/) for a brief introduction.

To render your Markdown-based slideshow on the fly, checkout [Remarkise](https://gnab.github.io/remark/remarkise).

### Getting Started

It takes only a few, simple steps to get up and running with remark:

1. Create an HTML file to contain your slideshow (see boilerplate below)
2. Open the HTML file in a decent browser
3. Edit the Markdown and/or CSS styles as needed, save and refresh!
4. Press `C` to clone a display; then press `P` to switch to presenter mode. Open help menu with `h`.

See any of the boilerplate-*.html files (the -local one requires building remark first), or just copy the boilerplate HTML below to start:

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

- [The Official remark Slideshow](https://remarkjs.com/)
- [Coloured Terminal Listings in remark](https://joshbode.github.io/remark/ansi.html) by [joshbode](https://github.com/joshbode)

Other interesting stuff:

- [gnab.github.com/editorjs](http://gnab.github.io/editorjs)
- [judoole.github.com/GroovyBDD](http://judoole.github.io/GroovyBDD)
- [bekkopen.github.com/infrastruktur-som-kode](http://bekkopen.github.io/infrastruktur-som-kode)
- [ivarconr.github.com/Test-Driven-Web-Development/slides](http://ivarconr.github.io/Test-Driven-Web-Development/slides)
- [havard.github.com/node.js-intro-norwegian](http://havard.github.io/node.js-intro-norwegian)
- [mobmad.github.com/js-tdd-erfaringer](http://mobmad.github.io/js-tdd-erfaringer)
- [roberto.github.com/ruby-sinform-2012](http://roberto.github.io/ruby-sinform-2012)
- [http://asmeurer.github.io/python3-presentation/slides.html](http://asmeurer.github.io/python3-presentation/slides.html)
- [Lecture notes using remark](http://keysan.me/ee361/)
- [Time series analysis: theory and practice (a course using Remark)](http://jmlilly.net/course.html)
- [sinedied.github.com/backslide](https://github.com/sinedied/backslide)

### Printing

Converting to PDF is primarily supported via Chrome's Print to PDF feature. Note that the styling is not exact; See [#50](https://github.com/gnab/remark/issues/50#issuecomment-223887379) for some recommended CSS to add to your styles.

Alternatively, you can use [DeckTape](https://github.com/astefanutti/decktape), a PDF exporter for HTML presentation frameworks that provides support for remark.

### Contributors

Thanks goes to these people for their contributions:

- Aaron Meurer
- Adam Obeng
- Adam Strzelecki
- Aleksandar Trifunovic
- Alexander Brett
- Alex Claman
- Alex Y. Wagner
- Allan Jiang
- Amin Bandali
- Andrea Georgieva
- Andrew Gaul
- Andrey Ustyuzhanin
- Antonin Stefanutti
- Axel Rauschmayer
- Baron Schwartz
- Bastian Venthur
- Bengt Lüers
- Benjamin Stigsen
- Bernát Kalló
- bobappleyard
- Brandon Keepers
- Breno Polanski
- Bruno Fagundez
- bugdone
- Cameron Daigle
- Chris Kanich
- Christian Dreier
- Christopher McClellan
- Christoph Gnip
- cjwit
- Claudio Bley
- Daan van Berkel
- Daniel Stankiewicz
- Daniel Wang
- Danny Tuppeny
- Dan Steingart
- datamike
- Dave Henderson
- David Richards
- derickfay
- Dirk Husemann
- Erwann Mest
- Fabian
- Felix C. Stegerman
- Florian Rathgeber
- follower
- Gerard Capes
- gnab
- Grégoire Pineau
- Gurjeet Singh
- Hadrien Frank Cardinal de Cuzey
- Hiroshi Fukada
- Hubert Chen
- Hunter-Github
- hydroid7
- Ivo Wever
- J_4lexander
- Jason
- Jason Underhill
- Jérôme Petazzoni
- Jimmy Merrild Krag
- Joe Beda
- Joel Porquet
- Johannes Wienke
- Julien Wajsberg
- kellyoconor
- kerim
- kernc
- Kim Joar Bekkelund
- Lauro Caetano
- Loreia
- Marcel Schilling
- Markus Schanz
- Martin
- Martin 'Hasan' Bramwell
- Mathias Bynens
- Matthew
- Mears-UFL
- mhor
- Michael Byrne
- Michael Grosser
- Michael Mol
- Michael Sanford
- Mike Pennisi
- Morton Fox
- mrbald
- Nicolas Hart
- Oleksiy Syvokon
- Ole Petter Bang
- Ozan K
- Pavel Boldyrev
- Pedro
- Pedro Martin
- Peter Jausovec
- petitviolet
- Pi-Hsun Shih
- pille1842
- piranha
- pospi
- Psychos-Yi
- punkish
- Radovan Bast
- Rahul Bansal
- Rasmus Vestergaard Hansen
- rasmusvhansen
- Renato Alves
- rglepe
- Rich Trott
- Roberto Soares
- Robert Perce
- Robert Szmurło
- Robin Berjon
- Rolf
- Rostyk
- Russell Keith-Magee
- Ryan Thomson
- Sarah Binney
- Scott Hewitt
- Sebastian Pipping
- Sequoia McDowell
- Shane Curcuru
- Shaun Hammill
- siba prasad samal
- Simon Hengel
- Stian Mathiassen
- stu-b-doo
- Sylvain Abélard
- Takashi Kanemoto
- Tej Chajed
- Thomas Ballinger
- Tobias Løfgren
- Todd Brannam
- Todd Gureckis
- Tome Tanasovski
- Tom Kraak
- Torgeir Thoresen
- tripu
- vdepabk2t
- William Ghelfi
- Willi Rath
- Wouter Sioen
- Yihui Xie
- Yinhe Zhang
- Yohan Lasorsa
- Yoshiya Hinosawa

### License

remark is licensed under the MIT license. See LICENSE for further
details.
