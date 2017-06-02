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
        "## %s" % _("Applet usage and features"),
        _("The usage of this applet is very simple. Each task list is represented by a sub menu and each sub menu item inside a sub menu represents a task."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + \
        _("To add a new tasks list, simply focus the **New tasks list...** entry, give a name to the tasks list and press [[Enter]]."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + \
        _("To add a new task, simply focus the **New task...** entry, give a name to the task and press [[Enter]]."),
        "- " + _("All tasks lists and tasks can be edited in-line."),
        "- " + _("Tasks can be marked as completed by changing the checked state of their sub menu items."),
        "- " + _("Each tasks list can have its own settings for sorting tasks (by name and/or by completed state), remove task button visibility and completed tasks visibility."),
        "- " + _("Each tasks list can be saved as individual TODO files and also can be exported into a file for backup purposes."),
        "- " + _("Tasks can be reordered by simply dragging them inside the tasks list they belong to (only if all automatic sorting options for the tasks list are disabled)."),
        "- " + _("Tasks can be deleted by simply pressing the delete task button (if visible)."),
        "- " + _("Colorized priority tags support. The background and text colors of a task can be colorized depending on the @tag found inside the task text."),
        "- " + _("Configurable hotkey to open/close the menu."),
        "- " + _("Read the tooltips of each option on this applet settings window for more details."),
        "***",
        "## %s" % _("Keyboard shortcuts"),
        _("The keyboard navigation inside this applet menu is very similar to the keyboard navigation used by any other menu on Cinnamon. But it's slightly changed to facilitate tasks and sections handling and edition."),
        "\n",
        "### %s" % _("When the focus is on a task"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("[[Ctrl]] + [[Spacebar]]: Toggle the completed (checked) state of a task."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("[[Shift]] + [[Delete]]: Deletes a task and focuses the element above of the deleted task."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("[[Alt]] + [[Delete]]: Deletes a task and focuses the element bellow the deleted task."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("[[Ctrl]] + [[Arrow Up]] or [[Ctrl]] + [[Arrow Down]]: Moves a task inside its tasks list."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("[[Insert]]: Will focus the **New task...** entry of the currently opened task section."),
        "\n",
        "### %s" % _("When the focus is on a task section"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("[[Arrow Left]] and [[Arrow Right]]: If the tasks list (sub menu) is closed, these keys will open the sub menu. If the sub menu is open, these keys will move the cursor inside the sub menu label to allow the edition of the section text."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("[[Insert]]: Will focus the **New task...** entry inside the task section. If the task section sub menu isn't open, it will be opened."),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "### %s" % _("When the focus is on the **New task...** entry"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("[[Ctrl]] + [[Spacebar]]: Toggles the visibility of the tasks list options menu."),
        "***",
        "## %s" % _("Known issues"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- " + _("**Hovering over items inside the menu doesn't highlight menu items nor sub menus:** This is actually a desired feature. Allowing the items to highlight on mouse hover would cause the entries to loose focus, resulting in the impossibility to keep typing text inside them and constantly forcing us to move the mouse cursor to regain focus."),
        "- **%s** %s" % (_("Task entries look wrong:"), _(
            # TO TRANSLATORS: MARKDOWN string. Respect formatting.
            "Task entries on this applet have the ability to wrap its text in case one sets a fixed width for them. They also can be multi line ([[Shift]] + [[Enter]] inside an entry will create a new line). Some Cinnamon themes, like the default Mint-X family of themes, set a fixed width and a fixed height for entries inside menus. These fixed sizes makes it impossible to programmatically set a desired width for the entries (at least, I couldn't find a way to do it). And the fixed height doesn't allow the entries to expand, completely breaking the entries capability to wrap its text and to be multi line.")),
        "\n",
        "### %s" % _("This is how entries should look like"),
        "\n",
        "![%s](%s)" % (_("Correct entries styling"), "./assets/00-correct-entries-styling.png"),
        "\n",
        "### %s" % _("This is how entries SHOULD NOT look like"),
        "\n",
        "![%s](%s)" % (_("Incorrect entries styling"), "./assets/00-incorrect-entries-styling.png"),
        "\n",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("The only way to fix this (that I could find) is by editing the Cinnamon theme that one is using and remove those fixed sizes. The CSS selectors that needs to be edited are **.menu StEntry**, **.menu StEntry:focus**, **.popup-menu StEntry** and **.popup-menu StEntry:focus**. Depending on the Cinnamon version the theme was created for, one might find just the first two selectors or the last two or all of them. The CSS properties that need to be edited are **width** and **height**. They could be removed, but the sensible thing to do is to rename them to **min-width** and **min-height** respectively. After editing the theme's file and restarting Cinnamon, the entries inside this applet will look and work like they should."),
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
        self.html_templates = localized_help_modules.HTMLTemplates()
        self.html_assets = localized_help_modules.HTMLInlineAssets(repo_folder=repo_folder)
        self.lang_list = []
        self.sections = []
        self.options = []
        self.only_english = md("<div style=\"font-weight:bold;\" class=\"container alert alert-info\">{0}</div>".format(
            _("The following two sections are available only in English.")))

        try:
            contributors_file = open(os.path.join(XLET_DIR, "CONTRIBUTORS.md"), "r")
            contributors_rawdata = contributors_file.read()
            contributors_file.close()
            self.contributors = self.html_templates.boxed_container.format(md(contributors_rawdata))
        except Exception as detail:
            print(detail)
            self.contributors = None

        try:
            changelog_file = open(os.path.join(XLET_DIR, "CHANGE_LOG.md"), "r")
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
            sections="\n".join(self.sections),
            only_english=self.only_english,
            contributors=self.contributors if self.contributors else "",
            changelog=self.changelog if self.changelog else ""
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
