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
from cinnamon_tools_python_modules.locale_list import locale_list

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

    current_language_stats["total"] = current_language_stats["total"] + 1

    if trans:
        result = trans(aStr)

        try:
            result = result.decode("utf-8")
        except:
            result = result

        if result != aStr:
            current_language_stats["translated"] = current_language_stats["translated"] + 1
            return result

    return aStr


# Base information about the xlet (Description, features, dependencies, etc.).
# This is used by the xlet README and the xlets help file.
# Returns a "raw markdown string" that it is used "as-is" for the README creation,
# but it's converted to HTML when used by the help file.
#
# Separate each "block" with an empty space, not a new line. When joining the
# string with a new line character, an empty space will add one line, but a
# new line character will add two lines. This is just to keep the README content
# somewhat homogeneous.
def get_content_base(for_readme=False):
    return "\n".join([
        "## %s" % _("Description"),
        "",
        _("This applet is a custom version of the default Cinnamon Menu applet, but infinitely more customizable."),
        "",
        "## %s" % _("Added options/features"),
        "",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "**Note:** Read the help file for this applet (Help item on this applet context menu) for detailed information about this applet keyboard navigation and other features." if for_readme else "",
        "",
        "- %s" % _("All mayor elements of the menu can be hidden or placed anywhere on the menu."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _(
            "Added Fuzzy search. Based on [Sane Menu](https://cinnamon-spices.linuxmint.com/applets/view/258s) applet by **nooulaif**."),
        "- %s" % _("Added a custom launchers box that can run any command/script/file and can be placed at the top/bottom of the menu or to the left/right of the searchbox."),
        "- %s" % _("Custom launchers icons can have a custom size and can be symbolic or full color."),
        "- %s" % _("Custom launchers can execute any command (as entered in a terminal) or a path to a file. If the file is an executable script, an attempt to execute it will be made. Otherwise, the file will be opened with the systems handler for that file type."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The **Quit buttons** can now be moved next the the custom launchers box and can have custom icons (ONLY when they are placed next to the custom launchers box). They also can be hidden all at once or individually."),
        "- %s" % _("The searchbox can have a fixed width or an automatic width to fit the menu width."),
        "- %s" % _("The applications info box can be hidden or replaced by traditional tooltips. Its text can also be aligned to the left."),
        "- %s" % _("The size of the Favorites/Categories/Applications icons can be customized."),
        "- %s" % _("The amount of recent files can be customized."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The **Recent Files** category can be hidden. This is for people who want the **Recent Files** category hidden without disabling recent files globally."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The **All Applications** category can be removed from the menu."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The **Favorites** can now be displayed as one more category. The **All Applications** category has to be hidden."),
        "- %s" % _("The placement of the categories box and the applications box can be swapped."),
        "- %s" % _("Scrollbars in the applications box can be hidden."),
        "- %s" % _("The padding of certain menu elements can be customized to override the current theme stylesheets."),
        "- %s" % _("Recently installed applications highlighting can be disabled."),
        "- %s" % _("Recently used applications can be remembered and will be displayed on a category called **Recent Apps**. The applications will be sorted by execution time and the name and icon of the category can be customized."),
        "- %s" % _("Categories can be selected on hover (system default) or by clicking on them."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The default **Add to panel**, **Add to desktop** and **Uninstall** context menu items can be hidden."),
        "- %s" % _("The menu editor can be directly opened from this applet context menu without the need to open it from the settings windows of this applet."),
        "- %s" % _("The context menu for applications has 5 new items:"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s" % _("**Run as root:** Executes application as root."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s" % _("**Edit .desktop file:** Open the application's .desktop file with a text editor."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s" % _("**Open .desktop file folder:** Open the folder where the application's .desktop file is stored."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s" % _("**Run from terminal:** Open a terminal and run application from there."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "    - %s" % _("**Run from terminal as root:** Same as above but the application is executed as root."),
        "",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "## Menu *emulating* the Whisker menu (XFCE)" if for_readme else "",
        "",
        "![Whisker menu](https://odyseus.github.io/CinnamonTools/lib/img/CustomCinnamonMenu-001.png \"Whisker menu\")" if for_readme else "",
        ""
    ])


# The real content of the HELP file.
def get_content_extra():
    return md("{}".format("\n".join([
        "## %s" % _("Keyboard navigation"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "**%s** %s" % (_("Note:"), _("Almost all keyboard shortcuts on this menu are the same as the original menu. There are just a couple of differences that I was forced to add to my menu to make some of its features to work.")),
        "",
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
        "",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "## %s" % _("Applications left click extra actions"),
        _("When left clicking an application on the menu, certain key modifiers can be pressed to execute an application in a special way."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Shift]] + **Left click**: Executes application as root."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Ctrl]] + **Left click**: Open a terminal and run application from there."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("[[Ctrl]] + [[Shift]] + **Left click**: Open a terminal and run application from there, but the application is executed as root."),
        "",
        "## %s" % _("About \"Run from terminal\" options"),
        _("These options are meant for debugging purposes (to see the console output after opening/closing a program to detect possible errors, for example). Instead of opening a terminal to launch a program of which one might not know its command, one can do it directly from the menu and in just one step. Options to run from a terminal an application listed on the menu can be found on the applications context menu and can be hidden/shown from this applet settings window."),
        "",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("By default, these options will use the system's default terminal emulator (**x-terminal-emulator** on Debian based distributions). Any other terminal emulator can be specified inside the settings window of this applet, as long as said emulator has support for the **-e** argument. I did my tests with **gnome-terminal**, **xterm** and **terminator**. Additional arguments could be passed to the terminal emulator, but it's not supported by me."),
        "",
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
        "",
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
        self.compatibility_data = localized_help_modules.get_compatibility(
            xlet_meta=xlet_meta,
            for_readme=False
        )
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

            global current_language_stats
            current_language_stats = {
                "total": 0,
                "translated": 0
            }

            if current_language == "en":
                localized_help_modules.create_readme(
                    xlet_dir=XLET_DIR,
                    xlet_meta=xlet_meta,
                    content_base=get_content_base(for_readme=True)
                )

            only_english = md("<div style=\"font-weight:bold;\" class=\"alert alert-info\">{0}</div>".format(
                _("The following two sections are available only in English."))
            )

            compatibility_disclaimer = "<p class=\"text-danger compatibility-disclaimer\">{}</p>".format(
                _("Do not install on any other version of Cinnamon.")
            )

            compatibility_block = self.html_templates.bt_panel.format(
                context="success",
                custom_class="compatibility",
                title=_("Compatibility"),
                content=self.compatibility_data + "\n<br/>" + compatibility_disclaimer,
            )

            section = self.html_templates.locale_section_base.format(
                language_code=current_language,
                hidden="" if current_language is "en" else " hidden",
                introduction=self.get_introduction(),
                compatibility=compatibility_block,
                content_base=md(get_content_base(for_readme=False)),
                content_extra=get_content_extra(),
                localize_info=self.get_localize_info(),
                only_english=only_english,
            )

            option = self.get_option()

            # option could be None if the the language has no endonym or if the amount
            # of translated strings is lower than 50% of the total translatable strings.
            if option is not None:
                self.sections.append(section)
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

        localized_help_modules.save_file(path=self.help_file_path,
                                         data=html_doc,
                                         creation_type=self.creation_type)

    def do_dummy_install(self):
        podir = os.path.join(XLET_DIR, "files", XLET_UUID, "po")
        done_one = False
        dummy_locale_path = os.path.join("../../", "tmp", "locales", XLET_UUID)

        for root, subFolders, files in os.walk(podir, topdown=False):
            for file in files:
                pofile_path = os.path.join(root, file)
                parts = os.path.splitext(file)

                if parts[1] == ".po":
                    try:
                        try:
                            lang_name = locale_list[parts[0]]["name"]
                        except:
                            lang_name = ""

                        localized_help_modules.validate_po_file(
                            pofile_path=pofile_path,
                            lang_name=lang_name,
                            xlet_meta=xlet_meta
                        )
                    finally:
                        self.lang_list.append(parts[0])
                        this_locale_dir = os.path.join(dummy_locale_path, parts[0], "LC_MESSAGES")
                        GLib.mkdir_with_parents(this_locale_dir, 0o755)
                        subprocess.call(["msgfmt", "-c", pofile_path, "-o",
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

    def get_language_stats(self):
        stats_total = str(current_language_stats["total"])
        stats_translated = str(current_language_stats["translated"])

        return int(100 * float(stats_translated) / float(stats_total))

    def get_option(self):
        try:
            endonym = locale_list[current_language]["endonym"]
            language_name = locale_list[current_language]["name"]
        except:
            endonym = None
            language_name = None

        if current_language == "en" or (endonym is not None and self.get_language_stats() >= 50):
            # Define them first before self.get_language_stats() is called so these
            # strings are also counted.
            xlet_help = _("Help")
            xlet_contributors = _("Contributors")
            xlet_changelog = _("Changelog")
            title = _("Help for %s") % xlet_meta["name"]

            return self.html_templates.option_base.format(
                endonym=endonym,
                language_name=language_name,
                selected="selected " if current_language is "en" else "",
                language_code=current_language,
                xlet_help=xlet_help,
                xlet_contributors=xlet_contributors,
                xlet_changelog=xlet_changelog,
                title=title
            )
        else:
            return None

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
    creation_type = None

    if options.production:
        creation_type = "production"
        help_file_path = os.path.join(XLET_DIR, "files", XLET_UUID, "HELP.html")
    elif options.dev:
        creation_type = "dev"
        repo_tmp_folder = os.path.join(repo_folder, "tmp", "help_files")
        GLib.mkdir_with_parents(repo_tmp_folder, 0o755)
        help_file_path = os.path.join(repo_tmp_folder, XLET_UUID + "-HELP.html")

    if help_file_path is not None:
        m = Main()
        m.creation_type = creation_type
        m.help_file_path = help_file_path
        m.do_dummy_install()
