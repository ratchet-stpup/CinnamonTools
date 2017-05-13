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
        "## %s" % _("Dependencies"),
        "**%s**" % _("If one or more of these dependencies are missing in your system, you will not be able to use this applet."),
        "### %s" % _("xsel command"),
        _("XSel is a command-line program for getting and setting the contents of the X selection."),
        "- %s %s" % (
            _("Debian and Archlinux based distributions:"),
            # TO TRANSLATORS: MARKDOWN string. Respect formatting.
            _("The package is called **xsel**.")
        ),
        "\n",
        "### %s" % _("xdg-open command"),
        _("Open a URI in the user's preferred application that handles the respective URI or file type."),
        "- %s %s %s" % (
            _("Debian and Archlinux based distributions:"),
            # TO TRANSLATORS: MARKDOWN string. Respect formatting.
            _("This command is installed with the package called **xdg-utils**."),
            _("Installed by default in modern versions of Linux Mint.")
        ),
        "\n",
        "### %s" % _("Python 3"),
        _("It should come already installed in all Linux distributions."),
        "\n",
        "### %s" % _("requests Python 3 module"),
        _("Requests allow you to send HTTP/1.1 requests. You can add headers, form data, multi-part files, and parameters with simple Python dictionaries, and access the response data in the same way. It's powered by httplib and urllib3, but it does all the hard work and crazy hacks for you."),
        "- %s %s %s" % (
            _("Debian and Archlinux based distributions:"),
            # TO TRANSLATORS: MARKDOWN string. Respect formatting.
            _("This command is installed with the package called **xdg-utils**."),
            _("Installed by default in modern versions of Linux Mint.")
        ),
        "- %s %s %s" % (
            _("Debian based distributions:"),
            # TO TRANSLATORS: MARKDOWN string. Respect formatting.
            _("The package is called **python3-requests**."),
            _("Installed by default in modern versions of Linux Mint.")
        ),
        "- %s %s" % (
            _("Archlinux based distributions:"),
            # TO TRANSLATORS: MARKDOWN string. Respect formatting.
            _("The package is called **python-requests**.")
        ),
        "\n",
        "**%s**" % _("After installing any of the missing dependencies, Cinnamon needs to be restarted"),
        "\n",
        "**%s** %s" % (_("Note:"), _("I don't use any other type of Linux distribution (Gentoo based, Slackware based, etc.). If any of the previous packages/modules are named differently, please, let me know and I will specify them in this help file.")),
        "***",
        "## %s" % _("Usage"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("There are 4 *translations mechanisms* (**Left click**, **Middle click**, **Hotkey #1** and **Hotkey #2**). Each translation mechanism can be configured with their own service providers, language pairs and hotkeys."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**First translation mechanism (Left click):** Translates any selected text from any application on your system. A hotkey can be assigned to perform this task."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**First translation mechanism ([[Ctrl]] + Left click):** Same as **Left click**, but it will bypass the translation history. A hotkey can be assigned to perform this task."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**Second translation mechanism (Middle click):** Same as **Left click**."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _(
            "**Second translation mechanism ([[Ctrl]] + Middle click):** Same as [[Ctrl]] + Left click."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**Third translation mechanism (Hotkey #1):** Two hotkeys can be configured to perform a translation and a forced translation."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**Fourth translation mechanism (Hotkey #2):** Two hotkeys can be configured to perform a translation and a forced translation."),
        _("All translations are stored into the translation history. If a string of text was already translated in the past, the popup will display that stored translated text without making use of the provider's translation service."),
        "***",
        "## %s" % _("About translation history"),
        _("I created the translation history mechanism mainly to avoid the abuse of the translation services."),
        "- %s" % _("If the Google Translate service is \"abused\", Google may block temporarily your IP. Or what is worse, they could change the translation mechanism making this applet useless and forcing me to update its code."),
        "- %s" % _("If the Yandex Translate service is \"abused\", you are \"wasting\" your API keys quota and they will be blocked (temporarily or permanently)."),
        _("In the context menu of this applet is an item that can open the folder were the translation history file is stored. From there, the translation history file can be backed up or deleted."),
        "\n",
        "**%s**" % _("NEVER edit the translation history file manually!!!"),
        "\n",
        "**%s**" % _("If the translation history file is deleted/renamed/moved, Cinnamon needs to be restarted."),
        "***",
        "## %s" % _("How to get Yandex translator API keys"),
        "- %s" % _("Visit one of the following links and register a Yandex account (or use one of the available social services)."),
        # TO TRANSLATORS: URL pointing to website in English
        "    - %s" % (_("English:") + " " + "https://tech.yandex.com/keys/get/?service=trnsl"),
        # TO TRANSLATORS: URL pointing to website in Russian
        "    - %s" % (_("Russian:") + " " + "https://tech.yandex.ru/keys/get/?service=trnsl"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("Once you successfully finish creating your Yandex account, you can visit the link provided several times to create several API keys. **DO NOT ABUSE!!!**"),
        "- %s" % _("Once you have several API keys, you can add them to Popup Translator's settings window (one API key per line)."),
        "\n",
        "### %s" % _("Important notes about Yandex API keys"),
        "- %s" % _("The API keys will be stored into a preference. Keep your API keys backed up in case you reset Popup Translator's preferences."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("**NEVER make your API keys public!!!** The whole purpose of going to the trouble of getting your own API keys is that the only one \"consuming their limits\" is you and nobody else."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("With each Yandex translator API key you can translate **UP TO** 1.000.000 (1 million) characters per day **BUT NOT MORE** than 10.000.000 (10 millions) per month."),
        "***"
    ])
    ))


# I have to add the custom CSS code separately and not include it directly in the
# HTML templates because the .format() function breaks when there is CSS code present
# in the string.
def get_css_custom():
    return "/* Specific CSS code for specific HELP files */"


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
