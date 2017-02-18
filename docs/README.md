### Requirements to build the HTML pages from the PUG files

- Node.js
    - Download the [source](https://nodejs.org/download/) and install.
```bash
$ ./configure
$ make
$ [sudo] make install
```

- Pug
```bash
$ [sudo] npm install pug-cli -g
```

- markdown-it
```bash
$ [sudo] npm install jstransformer-markdown-it -g
```

- Git
```bash
sudo apt-get install git git-doc git-gui
```

## Building notes

#### General notes

- Break **script** closing tags on all JS files. From `"</script>"` to `"</scr"+"ipt>"`. It breaks page loading when the JS code is embedded in the HTML. It seems not to be a problem when the scripts are linked files.
- Use of official CDNs for the [jQuery](https://code.jquery.com/) and [Bootstrap](https://www.bootstrapcdn.com/) script files.

#### Include files notes

- The *_navbar.pug* file has relative links.
- The *_navbar_for_standalone.pug* file has absolute links.

#### Highlight.js notes

- Download [highlight.js](https://highlightjs.org/download/) with support for these languages only (Bash, CSS, JSON, JavaScript, Markdown and Python).
- The xcode.css file is the theme used for syntax highlighting. Edit this CSS file to change the background color of the .hljs class to #f8f8f8.

#### Bootstrap notes

- Bootstrap theme from [Bootswatch](http://bootswatch.com/flatly/). Customization steps:
    1. Download the repository: `git clone https://github.com/thomaspark/bootswatch.git`
    2. Install dependencies (run command from inside the repo folder): `npm install`
    3. Make sure that you have `grunt` available in the command line. You can install `grunt-cli` as described on the [Grunt Getting Started](http://gruntjs.com/getting-started) page. In a nutshell, run `sudo npm install -g grunt-cli` command.
    4. Modify `variables.less` and `bootswatch.less` in one of the theme directories, or create your own in /custom.
    5. Type `grunt swatch:[theme]` to build the CSS for a theme, e.g., `grunt swatch:amelia` for Amelia. Or type `grunt swatch` to build them all at once.
    6. You can run `grunt` to start a server, watch for any changes to the LESS files, and automatically build a theme and reload it on change. Run `grunt server` for just the server, and `grunt watch` for just the watcher.
    7. Specific changes:
        1. Copy the content of the **flatly** folder into the **custom** folder.
        2. Edit the `variables.less` file from the **custom** folder.
            - Change all sizes to the sizes used by the **cerulean** theme.
            - Change the reference to the Lato font to Open Sans.
        3. Edit the `bootswatch.less` file from the **custom** folder.
            - Remove the font imports.
        4. Build the theme with `grunt swatch:custom`.
- The file *bootstrap-for-standalone.min.css* (for stand alone pages) is the same as the *bootstrap.min.css* file, but with the **Glyphicons Halflings** font family removed.
- If an icon from **Glyphicons Halflings** is ever needed on stand alone pages, just use something like the following:
```css
.glyphicon-chevron-up:before {
    content: url('Link to image') !important;
}
```
