#!/usr/bin/python3

import sys
import os
import subprocess
from argparse import ArgumentParser

repo_folder = os.path.realpath(os.path.abspath(os.path.join(
    os.path.normpath(os.path.join(os.getcwd(), *([".."] * 2))))))

# The modules folder is two levels up from were this script is run (the repository folder).
# "tools/cinnamon_tools_python_modules"
tools_folder = os.path.join(repo_folder, "tools")

if tools_folder not in sys.path:
    sys.path.insert(0, tools_folder)

from gi.repository import GLib
from cinnamon_tools_python_modules import help_modules
from cinnamon_tools_python_modules import mistune
from cinnamon_tools_python_modules.pyuca import Collator

pyuca_collator = Collator()
md = mistune.Markdown()

XLET_DIR = os.path.dirname(os.path.abspath(__file__))
XLET_UUID = str(os.path.basename(XLET_DIR))

xlet_meta = help_modules.XletMetadata(os.path.join(XLET_DIR, "files", XLET_UUID)).xlet_meta

if xlet_meta is None:
    quit()

tags = help_modules.HTMLTags()
translations = help_modules.Translations()
# Set current_language to global every time that needs to be assigned.
current_language = "en"


def _(aStr):
    trans = translations.get([current_language]).gettext

    if not aStr.strip():
        return aStr

    if trans:
        result = trans(aStr)

        try:
            result = result.decode("utf-8")
        except:
            result = result

        if result != aStr:
            return result

    return aStr


# The real content of the HELP file.
def get_content():
    return md("{}".format("\n".join([
        "## %s" % _("Description"),
        _("Argos for Cinnamon is an applet that turns executables' standard output into panel dropdown menus. It is inspired by, and fully compatible with, the Gnome Shell extension called [Argos](https://github.com/p-e-w/argos) by [Philipp Emanuel Weidmann](https://github.com/p-e-w), which in turn is inspired by, and fully compatible with, the [BitBar](https://github.com/matryer/bitbar) application for macOS. Argos for Cinnamon supports many [BitBar plugins](https://github.com/matryer/bitbar-plugins) without modifications, giving you access to a large library of well-tested scripts in addition to being able to write your own."),
        "<div class=\"alert alert-info\">",
        md(_("I will use the words *plugin* or *script* when referring to a script file associated with an instance on **Argos for Cinnamon** applet.")),
        "</div>",
        "\n",
        "***",
        "\n",
        "## %s" % _("Key features"),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**100% API [compatible with BitBar 1.9.2](#argos-bitbar-compatibility):** All BitBar plugins that run on Linux (i.e. do not contain macOS-specific code) will work with Argos (else it's a bug)."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**Beyond BitBar:** Argos can do everything that BitBar can do, but also some things that BitBar can't do (yet). See the documentation for details."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**Sophisticated asynchronous execution engine:** No matter how long your scripts take to run, Argos will schedule them intelligently and prevent blocking."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" %
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("**Unicode support:** Just print your text to stdout. It will be rendered the way you expect."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**Optimized for minimum resource consumption:** Even with multiple plugins refreshing every second, Argos typically uses less than 1% of the CPU."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**Fully [documented](#argos-usage).**"),
        "***",
        "\n",
        "## %s" % _("Dependencies"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- **%s:** %s" % (_("xdg-open command"),
                          ("Open a URI in the user's preferred application that handles the respective URI or file type.")),
        "    - %s %s %s" % (_("Debian and Archlinux based distributions:"),
                            _("This command is installed with the package called **xdg-utils**."),
                            _("Installed by default in modern versions of Linux Mint.")),
        "***",
        "\n",
        "<span id=\"argos-usage\"></span>",
        "\n",
        "## %s" % _("Usage"),
        "\n",
        _("After placing a new instance of **Argos for Cinnamon** into a panel, one of the example scripts provided by this applet will be automatically attached to it and a menu will be created based on the output of the executed plugin. These example scripts contain various examples of what **Argos for Cinnamon** can do."),
        "\n",
        _("A just placed applet will have an initial execution interval of 0 seconds (zero seconds) and an initial applet text rotation interval of 3 seconds (three seconds). The execution interval is set to 0 seconds because the initial example script doesn't have any dynamic data that requires update. And the applet text rotation interval is set to 3 seconds so the text rotation of the example script can be seen in action."),
        "\n",
        _("For scripts that display non dynamic data, it isn't needed an execution interval. But if your script displays dynamic data (a clock for example), then an execution and/or applet text rotation interval needs to be specified. Both of these values can be set from the applet context menu."),
        "\n",
        "<div class=\"alert alert-info\">",
        md(_("The three example scripts provided by this applet will produce the exact same output, but they are created using three different languages (**bash_examples.sh**, **python_examples.py** and **ruby_examples.rb**).")),
        "</div>",
        "<div class=\"alert alert-warning\">",
        "\n",
        "<strong>%s</strong>" % _(
            "Never save your custom plugins/scripts inside this applet folder. Otherwise, you will loose them all when there is an update for the applet."),
        "</div>",
        "\n",
        "### %s" % _("File name format"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("**Argos for Gnome Shell** parses the script's file name to extract certain set of preferences. **Argos for Cinnamon** doesn't parse the script's file name in such way (nor in any other way). All the applet settings can be set from the applet settings window and/or from the applet context menu."),
        "### %s" % _("Output format"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Argos plugins are executables (such as shell scripts **(*)**) that print to standard output lines of the following form:"),
        """```
TEXT | ATTRIBUTE_1=VALUE ATTRIBUTE_2=VALUE ...
```""",
        "\n",
        _("All attributes are optional, so the most basic plugins simply print lines consisting of text to be displayed. To include whitespace, attribute values may be quoted using the same convention employed by most command line shells."),
        "\n",
        "<div class=\"alert alert-info\">",
        "<strong>%s</strong>" % _(
            "(*) Not just shell scripts, but also python scripts, ruby scripts or any other script in any other language that can print to standard output."),
        "</div>",
        "\n",
        "### %s" % _("Rendering"),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Lines containing only dashes (`---`) are *separators*."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Lines above the first separator belong to the applet button itself. If there are multiple such lines, they are displayed in succession, each of them for a configurable amount of time (rotation interval) before switching to the next. Additionally, all button lines get a dropdown menu item, except if their `dropdown` attribute is set to `false`."),
        "\n",
        _("Lines below the first separator are rendered as dropdown menu items. Further separators create graphical separator menu items."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Lines beginning with `--` are rendered in a submenu associated with the preceding unindented line. **Argos for Cinnamon** supports unlimited number of nested submenus."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("[Emoji codes](http://www.emoji-cheat-sheet.com) like `:horse:` and `:smile:` in the line text are replaced with their corresponding Unicode characters (unless the `emojize` attribute is set to `false`). Note that unpatched Cinnamon does not yet support multicolor emoji."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("[ANSI SGR escape sequences](https://en.wikipedia.org/wiki/ANSI_escape_code#graphics) and [Pango markup](https://developer.gnome.org/pango/stable/PangoMarkupFormat.html) tags may be used for styling. This can be disabled by setting the `ansi` and `useMarkup` attributes, respectively, to `false`."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Backslash escapes such as `\\n` and `\\t` in the line text are converted to their corresponding characters (newline and tab in this case), which can be prevented by setting the `unescape` attribute to `false`. Newline escapes can be used to create multi-line menu items."),
        "***",
        "\n",
        "## %s" % _("Line attributes"),
        "\n",
        "### %s" % _("Display"),
        _("Control how the line is rendered."),
        "\n",
        "| %s | %s | %s |" % (_("Attribute"), _("Value"), _("Description")),
        "| --- | --- | --- |",
        "| `color` | %s | %s |" % (_("Hex RGB/RGBA or color name"),
                                   _("Sets the text color for the item.")),
        "| `font` | %s | %s |" % (_("Font name"), _("Sets the font for the item.")),
        "| `size` | %s | %s |" % (_("Font size in points"), _(
            "Sets the font size for the item.")),
        "| `iconName` | %s | %s |" % (_("Icon name"),
                                      # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                                      _("Sets a menu icon for the item. See the [freedesktop.org icon naming specification](https://specifications.freedesktop.org/icon-naming-spec/icon-naming-spec-latest.html) for a list of valid names. **Argos only.** **Argos for Cinnamon** also supports a path to an icon file (paths starting with `~/` will be expanded to the user's home folder).")),
        "| `image`, `templateImage` | %s | %s |" % (_("Base64-encoded image file"),
                                                    # TO TRANSLATORS: MARKDOWN string. Respect
                                                    # formatting.
                                                    _("Renders an image inside the item. The image is positioned to the left of the text and to the right of the icon. Cinnamon does not have a concept of *template images*, so `image` and `templateImage` are interchangeable in Argos.")),
        "| `imageWidth`, `imageHeight` | %s | %s |" % (_("Width/height in pixels"),
                                                       # TO TRANSLATORS: MARKDOWN string. Respect
                                                       # formatting.
                                                       _("Sets the dimensions of the image. If only one dimension is specified, the image's original aspect ratio is maintained. **Argos only.**")),
        "| `length` | %s | %s |" % (_("Length in characters"), _(
            "Truncate the line text to the specified number of characters, ellipsizing the truncated part.")),
        "| `trim` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `false`, preserve leading and trailing whitespace of the line text.")),
        "| `dropdown` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `false` and the line is a button line (see above), exclude it from being displayed in the dropdown menu.")),
        "| `alternate` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `true`, the item is hidden by default, and shown in place of the preceding item when the [[Alt]] key is pressed.")),
        "| `emojize` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `false`, disable substitution of `:emoji_name:` with emoji characters in the line text.")),
        "| `ansi` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `false`, disable interpretation of ANSI escape sequences in the line text.")),
        "| `useMarkup` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `false`, disable interpretation of Pango markup in the line text. **Argos only.**")),
        "| `unescape` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `false`, disable interpretation of backslash escapes such as `\\n` in the line text. **Argos only.**")),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Attributes available on **Argos for Cinnamon** only."),
        "\n",
        "| %s | %s | %s |" % (_("Attribute"), _("Value"), _("Description")),
        "| --- | --- | --- |",
        "| `tooltip` | %s | %s |" % (_("Text to display as toolip"),
                                     _("Sets the tooltip for the item.")),
        "| `iconSize` | %s | %s |" % (_("An integer from 12 to 512"),
                                      # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                                      _("Sets the size for the item's `iconName`.")),
        "| `iconIsSymbolic` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `true`, the symbolic version of `iconName` will be used on the item (if exists).")),
        "### %s" % _("Actions"),
        _("Define actions to be performed when the user clicks on the line's menu item."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Action attributes are *not* mutually exclusive. Any combination of them may be associated with the same item, and all actions are executed when the item is clicked."),
        "\n",
        "| %s | %s | %s |" % (_("Attribute"), _("Value"), _("Description")),
        "| --- | --- | --- |",
        "| `bash` | %s | %s |" % (_("Bash command"), _(
            "Runs a command using `bash` inside any terminal emulator window.")),
        "| `terminal` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `false`, runs the Bash command in the background (i.e. without opening a terminal window).")),
        "| `param1`, `param2`, ... | %s | %s |" % (_("Command line arguments"),
                                                   # TO TRANSLATORS: MARKDOWN string. Respect
                                                   # formatting.
                                                   _("Arguments to be passed to the Bash command. *Note: Provided for compatibility with BitBar only. Argos allows placing arguments directly in the command string.*")),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "| `href` | URI | %s |" % _("Opens a URI in the application registered to handle it. URIs starting with `http://` launch the web browser, while `file://` URIs open the file in its associated default application. **Argos for Cinnamon** also supports paths starting with `~/` that will be automatically expanded to the user's home folder."),
        "| `eval` | %s | %s |" % (_("JavaScript code"),
                                  # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                                  _("Passes the code to JavaScript's `eval` function. **Argos only.**")),
        "| `refresh` | `true` %s `false` | %s |" %
        # TO TRANSLATORS: Conjunction used as follows:
        # "true or false"
        (_("or"),
         # TO TRANSLATORS: MARKDOWN string. Respect formatting.
         _("If `true`, re-runs the plugin, updating its output.")),
        "***",
        "<span id=\"argos-bitbar-compatibility\"></span>",
        "## %s" % _("BitBar plugins with Argos for Cinnamon"),
        "<div class=\"alert alert-warning\">",
        "<strong>",
        _("WARNING!!! DO NOT RANDOMLY TEST SCRIPTS!!!"),
        "\n<br>",
        _("1. Apply common sense. Read and understand what a script does and how demanding it could be."),
        "\n<br>",
        _("2. Test unknown scripts on an environment from which you can recover easily (for example, a virtual machine)."),
        "\n<br>",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("3. I found one specific case in which a script can freeze and ultimately crash Cinnamon. It's a script that downloads a GIF image from the internet, converts it to Base64 and then that encoded image is inserted into a menu item using the *image* attribute. I will not provide a link to that script, but if you follow the very first advice that I listed here, when you see that script, you will know."),
        "\n<br>",
        "</strong>",
        "</div>",
        "\n",
        _("These screenshots show how some scripts from the BitBar plugin repository look when rendered by Argos compared to the \"canonical\" BitBar rendering (macOS screenshots taken from https://getbitbar.com)."),
        "\n",
        "| %s | %s | %s |" % (_("Plugin"), _("BitBar on macOS"), _("Argos on Cinnamon")),
        "| --- | :---: | :---: |",
        "| [**Ping**](https://getbitbar.com/plugins/Network/ping.10s.sh) | ![Ping/BitBar](./assets/bitbar-001.png) | ![Ping/Argos](./assets/argos-001.png) |",
        "| [**Stock Ticker**](https://getbitbar.com/plugins/Finance/gfinance.5m.py) | ![Stock Ticker/BitBar](./assets/bitbar-002.png) | ![Stock Ticker/Argos](./assets/argos-002.png) |",
        "| [**World Clock**](https://getbitbar.com/plugins/Time/worldclock.1s.sh) | ![World Clock/BitBar](./assets/bitbar-003.png) | ![World Clock/Argos](./assets/argos-003.png) |",
        "| [**ANSI**](https://getbitbar.com/plugins/Tutorial/ansi.sh) | ![ANSI/BitBar](./assets/bitbar-004.png) | ![ANSI/Argos](./assets/argos-004.png) |",
        "***"
    ])
    ))


# I have to add the custom CSS code separately and not include it directly in the
# HTML templates because the .format() function breaks when there is CSS code present
# in the string.
def get_css_custom():
    return """/* Specific CSS code for specific HELP files */
/* Copied over the table class from bootstrap theme and applied it
 directly to the table tag.*/
table {
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 20px !important;
}
table>thead>tr>th,
table>tbody>tr>th,
table>tfoot>tr>th,
table>thead>tr>td,
table>tbody>tr>td,
table>tfoot>tr>td {
    padding: 8px !important;
    line-height: 1.42857143 !important;
    vertical-align: top !important;
    border-top: 1px solid #ecf0f1 !important;
}
table>thead>tr>th {
    vertical-align: bottom !important;
    border-bottom: 2px solid #ecf0f1 !important;
}
table>caption+thead>tr:first-child>th,
table>colgroup+thead>tr:first-child>th,
table>thead:first-child>tr:first-child>th,
table>caption+thead>tr:first-child>td,
table>colgroup+thead>tr:first-child>td,
table>thead:first-child>tr:first-child>td {
    border-top: 0 !important;
}
table>tbody+tbody {
    border-top: 2px solid #ecf0f1 !important;
}
table{
    border: 1px solid #ecf0f1 !important;
}
table>thead>tr>th,
table>tbody>tr>th,
table>tfoot>tr>th,
table>thead>tr>td,
table>tbody>tr>td,
table>tfoot>tr>td {
    border: 1px solid #ecf0f1 !important;
}
table>thead>tr>th,
table>thead>tr>td {
    border-bottom-width: 2px !important;
}

table>td,
table>th {
    position: static !important;
    float: none !important;
    display: table-cell !important;
}
table>thead>tr>td.active,
table>tbody>tr>td.active,
table>tfoot>tr>td.active,
table>thead>tr>th.active,
table>tbody>tr>th.active,
table>tfoot>tr>th.active,
table>thead>tr.active>td,
table>tbody>tr.active>td,
table>tfoot>tr.active>td,
table>thead>tr.active>th,
table>tbody>tr.active>th,
table>tfoot>tr.active>th {
    background-color: #ecf0f1 !important;
}
"""


class Main():

    def __init__(self):
        self.html_templates = help_modules.HTMLTemplates()
        self.html_assets = help_modules.HTMLInlineAssets(repo_folder=repo_folder)
        self.lang_list = []
        self.sections = []
        self.options = []

    def create_html_document(self):
        for lang in self.lang_list:
            global current_language
            current_language = lang

            if current_language != "en" and _("language-name") == "language-name":
                # If the endonym isn't provided, assume that the HELP file isn't translated.
                # Placed this comment here so the comment isn't extracted by xgettext.
                continue

            section = self.html_templates.locale_section_base.format(
                language_code=current_language,
                hidden="" if current_language is "en" else " hidden",
                introduction=self.get_introduction(),
                content=get_content(),
                localize_info=self.get_localize_info()
            )
            self.sections.append(section)

            option = self.get_option()
            self.options.append(option)

        html_doc = self.html_templates.html_doc.format(
            # This string doesn't need to be translated.
            # It's the initial title of the page that it's always in English.
            title="Help for {xlet_name}".format(xlet_name=xlet_meta["name"]),
            # WARNING!!! Insert the inline files (.css and .js) AFTER all string formatting has been done.
            # CSS code interferes with formatting variables. ¬¬
            js_localizations_handler=self.html_assets.js_localizations_handler if
            self.html_assets.js_localizations_handler else "",
            css_bootstrap=self.html_assets.css_bootstrap if self.html_assets.css_bootstrap else "",
            css_tweaks=self.html_assets.css_tweaks if self.html_assets.css_tweaks else "",
            css_base=self.html_templates.css_base,
            css_custom=get_css_custom(),
            options="\n".join(sorted(self.options, key=pyuca_collator.sort_key)),
            sections="\n".join(self.sections)
        )

        help_modules.save_html_file(path=self.help_file_path,
                                    data=html_doc)

    def do_dummy_install(self):
        podir = os.path.join(XLET_DIR, "files", XLET_UUID, "po")
        done_one = False
        dummy_locale_path = os.path.join("../../", "tmp", "locales", XLET_UUID)

        for root, subFolders, files in os.walk(podir, topdown=False):
            for file in files:
                parts = os.path.splitext(file)
                if parts[1] == ".po":
                    self.lang_list.append(parts[0])
                    this_locale_dir = os.path.join(dummy_locale_path, parts[0], "LC_MESSAGES")
                    GLib.mkdir_with_parents(this_locale_dir, 0o755)
                    subprocess.call(["msgfmt", "-c", os.path.join(root, file), "-o",
                                     os.path.join(this_locale_dir, "%s.mo" % XLET_UUID)])
                    done_one = True

        if done_one:
            print("Dummy install complete")

            if len(self.lang_list) > 0:
                translations.store(XLET_UUID, dummy_locale_path, self.lang_list)

            # Append english to lang_list AFTER storing the translations.
            self.lang_list.append("en")
            self.create_html_document()
        else:
            print("Dummy install failed")
            quit()

    def get_option(self):
        return self.html_templates.option_base.format(
            # TO TRANSLATORS: This is a placeholder.
            # Here goes your language name in your own language (a.k.a. endonym).
            endonym="English" if current_language is "en" else _("language-name"),
            selected="selected " if current_language is "en" else "",
            language_code=current_language,
            language_chooser_label=_("Choose language"),
            title=_("Help for %s") % xlet_meta["name"]
        )

    def get_introduction(self):
        return self.html_templates.introduction_base.format(
            # TO TRANSLATORS: Full sentence:
            # "Help for <xlet_name>"
            md("# %s" % (_("Help for %s") % xlet_meta["name"])),
            md("## %s" % _("IMPORTANT!!!")),
            md(_("Never delete any of the files found inside this xlet folder. It might break this xlet functionality.")),
            md(_("Bug reports, feature requests and contributions should be done on this xlet's repository linked next.") +
               " %s" % ("[GitHub](%s)" % xlet_meta["website"] if xlet_meta["website"] else xlet_meta["url"]))
        )

    def get_localize_info(self):
        return md("\n".join([
            "## %s" % _("Applets/Desklets/Extensions (a.k.a. xlets) localization"),
            "- %s" % _("If this xlet was installed from Cinnamon Settings, all of this xlet's localizations were automatically installed."),
            # TO TRANSLATORS: MARKDOWN string. Respect formatting.
            "- %s" % _("If this xlet was installed manually and not trough Cinnamon Settings, localizations can be installed by executing the script called **localizations.sh** from a terminal opened inside the xlet's folder."),
            "- %s" % _("If this xlet has no locale available for your language, you could create it by following the following instructions.") +
            " %s" % "[Wiki](https://github.com/Odyseus/CinnamonTools/wiki/Xlet-localization)"
        ]))


if __name__ == "__main__":
    parser = ArgumentParser(usage=help_modules.USAGE)
    group = parser.add_mutually_exclusive_group(required=False)

    group.add_argument("-p",
                       "--production",
                       help="Creates the help file into a temporary folder.",
                       action="store_true",
                       dest="production",
                       default=False)
    group.add_argument("-d",
                       "--dev",
                       help="Creates the help file into its final destination.",
                       action="store_true",
                       dest="dev",
                       default=False)

    options = parser.parse_args()

    if not (options.production or options.dev):
        parser.print_help()
        quit()

    help_file_path = None

    if options.production:
        help_file_path = os.path.join(XLET_DIR, "files", XLET_UUID, "HELP.html")
    elif options.dev:
        repo_tmp_folder = os.path.join(repo_folder, "tmp", "help_files")
        GLib.mkdir_with_parents(repo_tmp_folder, 0o755)
        help_file_path = os.path.join(repo_tmp_folder, XLET_UUID + "-HELP.html")

    if help_file_path is not None:
        m = Main()
        m.help_file_path = help_file_path
        m.do_dummy_install()
