### 0.10.2
* #123: Don't expand content class inside inline code.

### 0.10.1
* #171: Remove non-working 'w' shortcut.

### 0.10.0
* #188: Add direct URL to presenter mode.
* #187: Fix scroll wheel in Firefox.

### 0.9.1
* #177: Always start slide numbering at one.

### 0.9.0
* #177: Enable not counting specific slides.

### 0.8.2
* #182: Fix markdown rendering bug.

### 0.8.1
* #163: Call slide number format function with this set to slideshow.
* #180: Expand macros recursively.

### 0.8.0
* #72: Add initial support for macros.
* #143: Prevent generating navigation history.
* #144: Prevent navigation when clicking links.
* #170: Ignore keydown with meta and ctrl modifiers.
* #175: Add mirrored mode.

### 0.7.0
* #70: Add support for printing including presenter notes.
* #75: Enable cross-slide reference links.
* #106: Fix handling of blank, non-empty lines.
* #111: Add vertical scrollbar to presenter notes on overflow.
* #114: Include notes for upcoming slide in presenter mode.
* #116: Add support for highlighting code lines and spans.
* #117: Fix slide background positioning bug.
* #124: Fix blank slide bug.
* #130: Add support for customizing slide number format.
* #131: Add support for `exclude: true` slide class to exclude slide.

### 0.6.5
* #115: Highlight *-prefixed code block lines.
* #110: Enable click navigation when configured.
* #108: Add `sourceUrl` configuration option ([DanTup](https://github.com/DanTup)).
* #107: Add blackout mode.
* #104: Increase default font sizes.
* #102: Add default fonts to templates.

### 0.6.4
* #105/106: Support indented source code ([DanTup](https://github.com/DanTup)).

### 0.6.3
* #101: Make navigation using scroll configurable.

### 0.6.2
* #77: Enable Matjax for slide notes by keeping notes HTML in DOM.
* #82: Hide help screen when hitting Escape.
* #85, #87: No longer operate on escaped HTML.
* #98: Flatten CSS hierarchy for `remark-slide-content` to ease styling.

### 0.6.1
* #81: Introduce boilerplate HTML files ([gurjeet](https://github.com/gurjeet)).
* #83: Always include background colors and images.
* #91: Bundle Haskell syntax highlighting ([sol](https://github.com/sol)).
* #92: Use official highlight.js ([nanoant](https://github.com/nanoant)).
* #96: Add Bower integration ([trumbitta](https://github.com/trumbitta)).
* Run tests using PhantomJS, which enables running tests on Windows.

### 0.6.0
* #73: Fix infinite loop issue for cloned views ([peter50216](https://github.com/peter50216)).
* #71: Make `img { max-with: 100%}` work in Firefox ([obfusk](https://github.com/obfusk)).
* #69: Assign `remark-fading` class to slide being hidden to allow animated transitions ([freakboy3742](https://github.com/freakboy3742)).
* #68: Add overlay in presenter mode to indicate paused state ([freakboy3742](https://github.com/freakboy3742)).
* #67: Make slideshow controller customizable ([freakboy3742](https://github.com/freakboy3742)).
* #66: Add timer for presentation view ([freakboy3742](https://github.com/freakboy3742)).
* #64: Expose API endpoints for display functions ([freakboy3742](https://github.com/freakboy3742)).

### 0.5.9
* #62: Inherit presenter notes from template slide.

### 0.5.8
* #61: Only handle shortcut keys when meta/ctrl key is not pressed.

### 0.5.7
* Hardcode paper dimensions to make slides fit perfectly when printing / exporting to PDF.

### 0.5.6
* #50: Support printing / export to PDF via Save as PDF in Chrome.
* Extend API: ([gureckis](https://github.com/gureckis))
  * Add `slideshow.pause()` and `slideshow.resume()` for bypassing keyboard navigation.
  * Add `[before|after][Show|Hide]Slide` events.

### 0.5.5
* #53: Use highlight.js fork that fixes Scala multiline string issue.
* #54: Expose slide object in showSlide and hideSlide events.
* Add fullscreen mode toggle.

### 0.5.4
* Fix content class issue (#52) by allowing capital letters.

### 0.5.3
* Fix Firefox issue (#47) by handling quoted CSS URLs.

### 0.5.2
* Add presenter mode and support functionality for cloning slideshow.

### 0.5.1
* Fix Firefox issue (#47) by extending HTMLCollection with forEach.
* Fix empty paragraphs regression.
* Flatten CSS class hierarchy to ease styling.
* Remove default font size and family styles.

### 0.5.0
* Update API to allow creating and embedding multiple slideshows.
* Prefix CSS class names with `remark-` to avoid collisions.
* Add highlight-style slide property for setting highlight.js style.
* Highlighting language is no longer automatically determined.
  * Must either be configured for entire slideshow or specified per code block.
* Code classes are DEPRECATED, use GFM fenced code blocks instead.
* Fix content classes being expanded inside code blocks bug.

### 0.4.6
* Add background-image slide property.
* Make slide backgrounds centered, not repeated, and, if needed, down-scaled to fit slide.
* Make remark.config.set and .get functions for accessing configuration.
* Update highlighting styles when highlightStyle property is reconfigured.
* Update slideshow display ratio when ratio property is reconfigured.

### 0.4.5
* Fix multiple block quotes bug.
* Add HTTP language highlighting support.
* Add HOME and END shortcut keys for navigation to first and last slide.
* Add help overlay triggered by pressing ?.
* Add API methods:
  * `remark.loadFromString('markdown string')`
  * `remark.gotoFirstSlide()`
  * `remark.gotoLastSlide()`
  * `remark.gotoNextSlide()`
  * `remark.gotoPreviousSlide()`
  * `remark.gotoSlide(slideNoOrName)`
* Add `ratio` configuration option.

### 0.4.4
* Fix missing Markdown conversion of content inside HTML blocks.

### 0.4.3
* Fix .left CSS class (via @lionel-m).
* Fix support for block-quotes (via @joshbode).
* Update dependencies to support node v0.8.x.

### 0.4.2
* Emit 'ready' event.
* Upgrade marked.
* Enable Github Flavored Markdown (GFM).

### 0.4.1
* Perform regular property expansion after inheriting templates.
* Exclude highlight.js styles depending on background images.

### 0.4.0
* Slide classes are DEPRECATED, use slide `class` property instead.
* Slide properties:
  * name
  * class
  * continued
  * template
  * layout
* Expand `{{ property }}` to corresponding property value.
* Access slides by name in URL fragment.
* Upgrade highlight.js.

### 0.3.6
* Upgrade highlight.js.
* Upgrade marked.
* Configure embedded languages for build in package.json.
* Update embedded languages:
  * javascript
  * ruby
  * python
  * bash
  * java
  * php
  * perl
  * cpp
  * objectivec
  * cs
  * sql
  * xml
  * css
  * scala
  * coffeescript
  * lisp

### 0.3.5
* Convert slide attributes, i.e. .attribute=value.
* Fix slide content overflow issue.
* Embed more slide and content classes; `.left`, `.center`, `.right`, `.top`, `.middle` and `.bottom`.

### 0.3.4
* Upgrade marked.
* Disable Github Flavored Markdown (GFM) to prevent autolinks, i.e. src attributes for img or iframe tags turning into links.

### 0.3.3
* Expose `config` function.
* Add support for `highlightLanguage` configuration option.
* Add support for `highlightInline` configuration option.

### 0.3.2
* Expose highlighter engine ([kjbekkelund](https://github.com/kjbekkelund)).
* Handle 0 to 3 spaces before # in headings ([kjbekkelund](https://github.com/kjbekkelund)).
* Support headings inside DIVs ([kjbekkelund](https://github.com/kjbekkelund)).
* Use marked instead of Showdown ([kjbekkelund](https://github.com/kjbekkelund)).
* Build remark using Node.js instead of Ruby.
* Run tests using Buster.js instead of Jasmine.

### 0.3.1
* Initial event support ([kjbekkelund](https://github.com/kjbekkelund)).
* Made remark.config a function accepting configuration options.
* Added support for multiple content classes on a single line.

### 0.3.0

* Input Markdown source element should now be of type TEXTAREA instead of PRE.
* Added proper escaping of in-code HTML.
* Made highlight.js styles work on inline code as well as block code.

### 0.2.4

* Made highlight style configurable through `highlightStyle` option.
* Added current slide number to slides.
* Disabled highlighting of inline code without language hinting.

### 0.2.3

* Added full highlight.js supporting a whole bunch of languages.

### 0.2.2

* Simple handling of swiping, e.g. for iPhones ([kjbekkelund](https://github.com/kjbekkelund)).

### 0.2.1

* Fixed non-working links via touch events.
* Fixed non-working resize ([kjbekkelund](https://github.com/kjbekkelund)).

### 0.2.0

* Added slide navigation using page up/down keys and mouse wheel.
* Added touch events in order to support mobile phones ([kjbekkelund](https://github.com/kjbekkelund)).
* Go to the next slide when pressing Space ([kjbekkelund](https://github.com/kjbekkelund)).

### 0.1.2

* Prepending instead of appending default styles to &lt;head&gt; ([kjbekkelund](https://github.com/kjbekkelund)).

### 0.1.1

* Fixed bug with markdown contained in content classes, i.e. `.class[![image](img.jpg)]`.

### 0.1.0

* Initial version.
