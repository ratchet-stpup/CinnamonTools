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
from cinnamon_tools_python_modules import localized_help_modules
from cinnamon_tools_python_modules import mistune
from cinnamon_tools_python_modules.pyuca import Collator

pyuca_collator = Collator()
md = mistune.Markdown()

XLET_DIR = os.path.dirname(os.path.abspath(__file__))
XLET_UUID = str(os.path.basename(XLET_DIR))

xlet_meta = localized_help_modules.XletMetadata(
    os.path.join(XLET_DIR, "files", XLET_UUID)).xlet_meta

if xlet_meta is None:
    quit()

tags = localized_help_modules.HTMLTags()
translations = localized_help_modules.Translations()
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
        "## %s" % _("Dependencies"),
        "**%s**" % _("If one or more of these dependencies are missing in your system, you will not be able to use this extension."),
        "- %s %s" % (_("xsel command:"),
                     _("XSel is a command-line program for getting and setting the contents of the X selection.")),
        "- %s %s" % (_("trans command:"),
                     _("Command provided by the package translate-shell. Is a simple command line interface for several translation providers (Google Translate, Yandex Translate, Bing Translate and Apertium) which allows you to translate strings in your terminal.")),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s" % _("Check translate-shell [dependencies](https://github.com/soimort/translate-shell#dependencies) and [recommended dependencies](https://github.com/soimort/translate-shell#recommended-dependencies)."),
        "\n",
        "**%s** %s" % (_("Note:"), _("The translate-shell package available on Ubuntu 16.04.x/Linux Mint 18.x repositories is outdated and broken. It can be installed anyway so it will also install its dependencies. But updating to the latest version should be done as described bellow.")),
        "\n",
        "## %s" % _("How to install latest version of translate-shell"),
        "### %s" % _("Option 1. Direct Download"),
        _("This method will only install the trans script into the specified locations."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("For the current user only. **~/.local/bin** needs to be in your PATH."),
        "\n",
        """```shell
$ wget -O ~/.local/bin/trans git.io/trans && chmod ugo+rx ~/.local/bin/trans
```""",
        "\n",
        _("For all users without overwriting the installed version."),
        "\n",
        """```shell
$ sudo wget -O /usr/local/bin/trans git.io/trans && sudo chmod ugo+rx /usr/local/bin/trans
```""",
        "\n",
        "### %s" %
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Option 2. From Git - [More details](https://github.com/soimort/translate-shell/blob/develop/README.md#option-3-from-git-recommended-for-seasoned-hackers)"),
        _("This method will not just install the trans script but also its man pages. Refer to the link above for more installation details."),
        "\n",
        """```shell
$ git clone https://github.com/soimort/translate-shell
$ cd translate-shell
$ make
$ sudo make install
```""",
        "\n",
        "***",
        "## %s" % _("Extension usage"),
        _("Once installed and enabled, the following shortcuts will be available."),
        "### %s" % _("Global shortcuts (configurable from the extension settings)"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Super]] + [[T]]:** Open translator dialog."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Super]] + [[Shift]] + [[T]]:** Open translator dialog and translate text from clipboard."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Super]] + [[Alt]] + [[T]]:** Open translator dialog and translate from primary selection."),
        "\n",
        "### %s" % _("Shortcuts available on the translation dialog"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Ctrl]] + [[Enter]]:** Translate text."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Shift]] + [[Enter]]:** Force text translation. Ignores translation history."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Ctrl]] + [[Shift]] + [[C]]:** Copy translated text to clipboard."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Ctrl]] + [[S]]:** Swap languages."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Ctrl]] + [[D]]:** Reset languages to default."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**[[Escape]]:** Close dialog."),
        "\n",
        "***",
        "## %s" % _("Extension's settings window"),
        _("From this extension settings window, all options can be imported, exported and/or reseted to their defaults."),
        "\n",
        "- %s" % _("To be able to perform any of these actions, the settings schema needs to be installed in the system. This is done automatically when the extension is installed from the Cinnamon extensions manager. But if the extension was installed manually, the settings schema also needs to be installed manually. This is achieved by simply going to the extension folder and launch the following command:"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s %s" % (_("Command to install the settings schema:"),
                         "`./settings.py install-schema`"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s %s" % (_("Command to uninstall the settings schema:"),
                         "`./settings.py remove-schema`"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("To import/export settings, the **dconf** command needs to be available on the system."),
        "\n",
        "***"
    ])
    ))


# I have to add the custom CSS code separately and not include it directly in the
# HTML templates because the .format() function breaks when there is CSS code present
# in the string.
def get_css_custom():
    return "/* Specific CSS code for specific HELP files */"


# Inject some custom JavaScript code to be executed when page finalyzes to load.
def get_js_custom():
    return """
"""


class Main():

    def __init__(self):
        self.html_templates = localized_help_modules.HTMLTemplates()
        self.html_assets = localized_help_modules.HTMLInlineAssets(repo_folder=repo_folder)
        self.lang_list = []
        self.sections = []
        self.options = []

        try:
            contributors_file = open(os.path.join(XLET_DIR, "CONTRIBUTORS.md"), "r")
            contributors_rawdata = contributors_file.read()
            contributors_file.close()
            self.contributors = self.html_templates.boxed_container.format(md(contributors_rawdata))
        except Exception as detail:
            print(detail)
            self.contributors = None

        try:
            changelog_file = open(os.path.join(XLET_DIR, "CHANGELOG.md"), "r")
            changelog_rawdata = changelog_file.read()
            changelog_file.close()
            self.changelog = self.html_templates.boxed_container.format(md(changelog_rawdata))
        except Exception as detail:
            print(detail)
            self.changelog = None

    def create_html_document(self):
        for lang in self.lang_list:
            global current_language
            current_language = lang

            if current_language != "en" and _("language-name") == "language-name":
                # If the endonym isn't provided, assume that the HELP file isn't translated.
                # Placed this comment here so the comment isn't extracted by xgettext.
                continue

            only_english = md("<div style=\"font-weight:bold;\" class=\"alert alert-info\">{0}</div>".format(
                _("The following two sections are available only in English.")))

            section = self.html_templates.locale_section_base.format(
                language_code=current_language,
                hidden="" if current_language is "en" else " hidden",
                introduction=self.get_introduction(),
                content=get_content(),
                localize_info=self.get_localize_info(),
                only_english=only_english,
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
            sections="\n".join(self.sections),
            contributors=self.contributors if self.contributors else "",
            changelog=self.changelog if self.changelog else "",
            js_custom=get_js_custom()
        )

        localized_help_modules.save_html_file(path=self.help_file_path,
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
            xlet_help=_("Help"),
            xlet_contributors=_("Contributors"),
            xlet_changelog=_("Changelog"),
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
    parser = ArgumentParser(usage=localized_help_modules.USAGE)
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
