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
        "## %s" % _("Keyboard navigation"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "**%s** %s" % (_("Note:"), _("Almost all keyboard shortcuts on this menu are the same as the original menu. There are just a couple of differences that I was forced to add to my menu to make some of its features to work.")),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Left Arrow]] and [[Right Arrow]] keys:"),
        "    - %s" %
        _("Cycles through the favorites box, applications box and categories box if the focus is in one of these boxes."),
        "    - %s" %
        _("If the focus is on the custom launchers box, these keys will cycle through this box buttons."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Tab]] key:"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s" %
        _("If the favorites box, applications box or categories box are currently focused, the [[Tab]] key will switch the focus to the custom launchers box."),
        "    - %s" %
        _("If the focus is on the custom launchers box, the focus will go back to the categories box."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s" %
        _("If the custom launchers box isn't part of the menu, the [[Tab]] key alone or [[Ctrl]]/[[Shift]] + [[Tab]] key are pressed, it will cycle through the favorites box, applications box and categories box."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Up Arrow]] and [[Down Arrow]] keys:"),
        "    - %s" % _("If the favorites box, applications box or categories box are currently focused, these keys will cycle through the items in the currently highlighted box."),
        "    - %s" %
        _("If the focus is on the custom launchers box, the focus will go back to the categories box."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Page Up]] and [[Page Down]] keys: Jumps to the first and last item of the currently selected box. This doesn't affect the custom launchers."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Menu]] or [[Alt]] + [[Enter]] keys: Opens and closes the context menu (if any) of the currently highlighted item."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Enter]] key: Executes the currently highlighted item."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Escape]] key: It closes the main menu. If a context menu is open, it will close the context menu instead and a second tap of this key will close the main menu."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" %
        _("[[Shift]] + [[Enter]]: Executes the application as root. This doesn't affect the custom launchers."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Ctrl]] + [[Enter]]: Open a terminal and run application from there. This doesn't affect the custom launchers."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Ctrl]] + [[Shift]] + [[Enter]]: Open a terminal and run application from there, but the application is executed as root. This doesn't affect the custom launchers."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "***",
        "## %s" % _("Applications left click extra actions"),
        _("When left clicking an application on the menu, certain key modifiers can be pressed to execute an application in a special way."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Shift]] + **Left click**: Executes application as root."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Ctrl]] + **Left click**: Open a terminal and run application from there."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Ctrl]] + [[Shift]] + **Left click**: Open a terminal and run application from there, but the application is executed as root."),
        "***",
        "## %s" % _("About \"Run from terminal\" options"),
        _("These options are meant for debugging purposes (to see the console output after opening/closing a program to detect possible errors, for example). Instead of opening a terminal to launch a program of which one might not know its command, one can do it directly from the menu and in just one step. Options to run from a terminal an application listed on the menu can be found on the applications context menu and can be hidden/shown from this applet settings window."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("By default, these options will use the system's default terminal emulator (**x-terminal-emulator** on Debian based distributions). Any other terminal emulator can be specified inside the settings window of this applet, as long as said emulator has support for the **-e** argument. I did my tests with **gnome-terminal**, **xterm** and **terminator**. Additional arguments could be passed to the terminal emulator, but it's not supported by me."),
        "***",
        "## %s" % _("Favorites handling"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("If the favorites box is **displayed**, favorites can be added/removed from the context menu for applications and by dragging and dropping applications to/from the favorites box."),
        "    " +
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("**Note:** To remove a favorite, drag a favorite outside the favorites box into any part of the menu."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("If the favorites box is **hidden** and the favorites category is enabled, favorites can be added/removed from the context menu for applications and by dragging and dropping applications to the favorites category. Its simple, if a favorite is dragged into the favorites category, the favorite will be removed. If what you drag into the favorites category is a non bookmarked application, then that application will be added to the favorites."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    " + _("**Note:** The favorites category will update its content after changing to another category and going back to the favorites category."),
        "***",
        "## %s" % _("Troubleshooting/extra information"),
        "1. " + _("Run from terminal."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    1. **%s** %s" % (_("Debian based distributions:"),
                              _("If the command **x-terminal-emulator** doesn't run the terminal emulator that one wants to be the default, run the following command to set a different default terminal emulator.")),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "        - %s" % "`sudo update-alternatives --config x-terminal-emulator`",
        "        - %s" % _("Type in the number of the selection and hit enter."),
        "    2. **%s** %s" %
        (_("For other distributions:"),
         _("Just set the terminal executable of your choice on this applet settings window.")),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "2. %s" % _("There is a file inside this applet directory called **run_from_terminal.sh**. ***Do not remove, rename or edit this file***. Otherwise, all of the *Run from terminal* options will break."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "3. %s" % _("There is a folder named **icons** inside this applet directory. It contains several symbolic icons (most of them are from the Faenza icon theme) and each icon can be used directly by name (on a custom launcher, for example)."),
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
