# remark

A simplistic, in-browser, markdown-driven slideshow tool targeted at people who know their way around HTML and CSS, featuring:

- Markdown formatting, with smart extensions

- Automatic syntax highlighting, with optional language hinting

- Slide scaling, thus similar appearance on all devices / resolutions

- Touch support for smart phones and pads, i.e. swipe to navigate slides

### Usage

Visit [gnab.github.com/remark](http://gnab.github.com/remark) for a brief introduction.

1. Create a boilerplate HTML container:

        <!DOCTYPE html>
        <html>
          <head>
            <title>Title</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
            <script src="https://github.com/downloads/gnab/remark/remark-0.3.0.min.js" type="text/javascript"></script>
            <style type="text/css" media="screen">
              /* Slideshow styles */
            </style>
          </head>
          <body>
            <textarea id="source">

        .center.middle
        # Title

        ---

        # Agenda

        1. Introduction
        2. Deep-dive
        3. ...

        ---

        # Introduction

            </textarea>
            <div id="slideshow"></div>
          </body>
        </html>

2. Enter you Markdown-formatted slideshow and any styles needed in the assigned areas.

3. Launch the HTML file in a decent browser and enjoy!

### Slideshows created with remark

- [gnab.github.com/remark](http://gnab.github.com/remark)
- [gnab.github.com/editorjs](http://gnab.github.com/editorjs)

### Credits

- [torgeir](http://github.com/torgeir), for invaluable advice and feedback.
- [kjbekkelund](https://github.com/kjbekkelund), for tap and swipe commits.

### License

remark is licensed under the MIT license. See LICENCE for further
details.
