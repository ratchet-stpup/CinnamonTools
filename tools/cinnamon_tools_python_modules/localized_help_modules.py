#!/usr/bin/python3

import os
import json
import gettext
from shutil import copy

HTML_DOC = """<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <title>{title}</title>
    <link rel="shortcut icon" type="image/x-icon" href="./icon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script type="text/javascript">
    {js_localizations_handler}
    </script>
    <style type="text/css">
    {css_bootstrap}
    {css_tweaks}
    {css_base}
    {css_custom}
    </style>
</head>
<body>
<noscript>
<div class="alert alert-warning">
<p><strong>Oh snap! This page needs JavaScript enabled to display correctly.</strong></p>
<p><strong>This page uses JavaScript only to switch between the available languages and/or display images.</strong></p>
<p><strong>There are no tracking services of any kind and never will be (at least, not from my side).</strong></p>
</div> <!-- .alert.alert-warning -->
</noscript>
<div id="mainarea">
<nav class="navbar navbar-default navbar-fixed-top" role="navigation">
    <div class="container-fluid">
    <div class="navbar-header">
        <ul class="nav navbar-nav">
            <li><a id="nav-xlet-help" class="navbar-brand" href="#xlet-help"></a></li>
            <li><a id="nav-xlet-contributors" class="navbar-brand" href="#xlet-contributors"></a></li>
            <li><a id="nav-xlet-changelog" class="navbar-brand" href="#xlet-changelog"></a></li>
        </ul>
    </div>
    <form class="navbar-form navbar-collapse collapse navbar-right">
        <div class="form-group">
            <label id="localization-chooser-label" class="control-label" for="localization-switch"></label>
            <select class="form-control input-sm" id="localization-switch" onchange="self.toggleLocalizationVisibility(value, this);">
                {options}
            </select>
        </div>
    </form>
    </div>
</nav>
<span id="xlet-help">
<div class="container boxed">
{sections}
</div> <!-- .container.boxed -->
{only_english}
<span id="xlet-contributors">
{contributors}
<span id="xlet-changelog">
{changelog}
</div> <!-- #mainarea -->
<script type="text/javascript">toggleLocalizationVisibility(null);
{js_custom}</script>
</body>
</html>
"""

BOXED_CONTAINER = """<div class="container boxed">
{0}
</div> <!-- .container.boxed -->
"""

# I have to add the custom CSS code separately and not include it directly in the
# HTML templates because the .format() function breaks when there is CSS code present
# in the string.
BASE_CSS = """
/* For fixed header */
body {
    padding-top: 70px;
}
/* For fixed header */

.localization-chooser {
    padding: 1em !important;
    width: %100 !important;
}

/* Override %100 width so it doesn't ocupy the entire page width. */
#localization-switch {
    font-weight: bold !important;
    width: auto !important;
}

#localization-chooser-label {
    color: #FFFFFF !important;
}

.navbar-form {
    margin-top: 8px !important;
}
"""


INTRODUCTION = """
{0}
<div style="font-weight:bold;" class="alert alert-warning">
{1}
{2}
{3}
</div>
<hr>
"""


LOCALE_SECTION = """
<div id="{language_code}" class="localization-content{hidden}">
{introduction}
{content}
{localize_info}
</div> <!-- .localization-content -->
"""

# {endonym} inside an HTML comment at the very begening of the string so I can sort all
# the "option" elements by endonym.
OPTION = """<!-- {endonym} --><option {selected}data-title="{title}" data-language-chooser-label="{language_chooser_label}" data-xlet-help="{xlet_help}" data-xlet-contributors="{xlet_contributors}" data-xlet-changelog="{xlet_changelog}" value="{language_code}">{endonym}</option>"""


USAGE = """

SYNOPSIS

./create_localized_help.py [-d or --dev]
                           [-p or --production]

OPTIONS

==================================================================
This script should only be run from inside the repository's folder
==================================================================

-d
--dev
    This option will create the help file for the xlet and save it into a
    temporary folder in the root of the repository's folder.
    Example: /tmp/help_files/<XLET_UUID>-HELP.html

-p
--production
    This option will create the help file for the xlet and save it into its
    final destination (inside the xlet's folder).

"""


class HTMLTemplates():

    def __init__(self):
        self.html_doc = HTML_DOC
        self.css_base = BASE_CSS
        self.introduction_base = INTRODUCTION
        self.locale_section_base = LOCALE_SECTION
        self.option_base = OPTION
        self.boxed_container = BOXED_CONTAINER


# Use pure HTML instead of Markdown so I can "cut the middle man" (pug).
# Scratch that.
# Use Markdown instead of pure HTML so the translator doesn't need to worry
# about HTML tags.
# Using malformed HTML tags WILL break the HTML page.
# Using malformed Markdown WILL NOT break anything, it will just render the
# markup characters.
class HTMLTags():

    def h(self, aN=1, aStr=""):
        return "<h{0}>{1}</h{0}>".format(str(aN), str(aStr))

    def img(self, aTitle="", aImg=""):
        return "<img alt=\"{0}\" src=\"{1}\">".format(str(aTitle), str(aImg))

    def p(self, aStr=""):
        return "<p>{0}</p>".format(str(aStr))

    def code(self, aStr=""):
        return "<code>{0}</code>".format(str(aStr))

    def pre(self, aStr=""):
        return "<pre>{0}</pre>".format(str(aStr))

    def strong(self, aStr=""):
        return "<strong>{0}</strong>".format(str(aStr))

    def ul(self, aStr=""):
        return "<ul>{0}</ul>".format(str(aStr))

    def li(self, aStr=""):
        return "<li>{0}</li>".format(str(aStr))

    def comment(self, aStr=""):
        return "<!-- {0} -->".format(str(aStr))


class XletMetadata():

    def __init__(self, xlet_dir):
        try:
            file = open(os.path.join(xlet_dir, "metadata.json"), "r")
            raw_meta = file.read()
            file.close()
            self.xlet_meta = json.loads(raw_meta)
        except Exception as detail:
            print("Failed to get metadata - missing, corrupt, or incomplete metadata.json file")
            print(detail)
            self.xlet_meta = None


class Translations(object):

    def __init__(self):
        self._translations = {}
        self._null = gettext.NullTranslations()

    def store(self, domain, localedir, languages):
        for lang in languages:
            try:
                translations = gettext.translation(domain,
                                                   localedir,
                                                   [lang])
            except IOError:
                print("No translations found for language code '{}'".format(lang))
                translations = None

            if translations is not None:
                self._translations[lang] = translations

    def get(self, languages):
        for lang in languages:
            if lang in self._translations:
                return self._translations[lang]
        return self._null


class HTMLInlineAssets(object):

    def __init__(self, repo_folder):
        super(HTMLInlineAssets, self).__init__()
        self.css_bootstrap = None
        self.css_tweaks = None
        self.js_localizations_handler = None

        self.path_css_bootstrap = os.path.join(
            repo_folder, "docs", "lib", "css", "bootstrap.min.css")
        self.path_css_tweaks = os.path.join(repo_folder, "docs", "lib", "css", "tweaks.css")
        self.path_js_localizations_handler = os.path.join(
            repo_folder, "docs", "lib", "js", "localizations-handler.js")

        # Do the "heavy lifting" first.
        if os.path.exists(self.path_css_bootstrap):
            with open(self.path_css_bootstrap, "r") as bootstrap_css:
                self.css_bootstrap = bootstrap_css.read()
            bootstrap_css.close()

        if os.path.exists(self.path_css_tweaks):
            with open(self.path_css_tweaks, "r") as tweaks_css:
                self.css_tweaks = tweaks_css.read()
            tweaks_css.close()

        if os.path.exists(self.path_js_localizations_handler):
            with open(self.path_js_localizations_handler, "r") as localizations_handler_js:
                self.js_localizations_handler = localizations_handler_js.read()
            localizations_handler_js.close()


def get_parent_dir(fpath, go_up=0):
    """get_parent_dir

    Extract the path of the parent directory of a file path.

    Arguments:
        fpath {String} -- The full path to a file.

    Keyword Arguments:
        go_up {Number} -- How many directories to go up. (default: {0})

    Returns:
        [string] -- The new path to a directory.
    """
    dir_path = os.path.dirname(fpath)

    if go_up >= 1:
        for x in range(0, int(go_up)):
            dir_path = os.path.dirname(dir_path)

    return dir_path


def save_html_file(path, data):
    try:
        with open(path, "w") as help_file:
            help_file.write(data)

        help_file.close()

        if "help_files" not in path:
            repo_folder = get_parent_dir(path, 4)
            xlet_uuid = os.path.basename(get_parent_dir(path))
            destination = os.path.join(repo_folder, "docs", "help_files", xlet_uuid + ".html")
            copy(path, destination)
    except Exception as detail:
        print("Failed to write to %s" % path)
        print(detail)
        quit()

    quit()
