# remark

A simplistic, in-browser, markdown-driven slideshow tool targeted at people who know their way around HTML and CSS, featuring:

- Markdown formatting, with smart extensions

- Automatic syntax highlighting, with optional language hinting

- Slide scaling, thus similar appearance on all devices / resolutions

Visit [gnab.github.org/remark](http://gnab.github.org/remark) to see remark in action.

### Usage

1. Create at boilerplate HTML container:

        <html>
          <head>
            <script src="remark-x.y.min.js" type="text/javascript"></script>
            <style type="text/css">
              /* Slideshow styles */
            </style>
          </head>
          <body>
            <pre id="source">
              <!-- Slideshow markdown -->
            </pre>
            <div id="presentation"><div>
          </body>
        </html>

2. Replace the `remark-x.y-min.js` with the latest version available from the [downloads page](https://github.com/gnab/remark/downloads).

3. Enter you Markdown-formatted slideshow in the assigned area.

4. Launch the HTML file in a decent browser and enjoy!

### License 

remark is licensed under the MIT license. See LICENCE for further 
details.
