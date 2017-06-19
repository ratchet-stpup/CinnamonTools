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
        _("The function of this applet is very simple, create a menu based on the files/folders found inside a main folder (specified on this applet settings window). The files will be used to create menu items and the sub folders will be used to create sub-menus."),
        "",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("I mainly created this applet to replicate the functionality of the XFCE plugin called **Directory Menu** and the KDE widget called **Quick access**."),
        "",
        ("<h2 style=\"color:red;\">%s</h2>\n<span style=\"font-weight:bold; color:red;\">%s</span>" if for_readme else "<div class=\"alert alert-warning\"><h2>%s</h2>\n<p>%s</p></div>") % (
            _("Warning"),
            _("This applet has to read every single file/folder inside a main folder to create its menu. So, do not try to use this applet to create a menu based on a folder that contains thousands of files!!! Your system may slow down, freeze or even crash!!!")
        ),
        "",
        "## %s" % _("Features"),
        "- %s" % _("More than one instance of this applet can be installed at the same time."),
        "- %s" % _("A hotkey can be assigned to open/close the menu."),
        "- %s" % _("Menu items to .desktop files will be displayed with the icon and name declared inside the .desktop files themselves."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The menu can be kept open while activating menu items by pressing [[Ctrl]] + **Left click** or with **Middle click**."),
        "- %s" % _("This applet can create menu and sub-menu items even from symbolic links found inside the main folder."),
        "## %s" % _("Settings window") if for_readme else "",
        "",
        "![Settings window](https://odyseus.github.io/CinnamonTools/lib/img/QuickMenu-001.png \"Settings window\")" if for_readme else "",
        "",
        "## %s" % _(
            "Image featuring different icons for each sub-menu and different icon sizes") if for_readme else "",
        "",
        "![Image featuring different icons for each sub-menu and different icon sizes](https://odyseus.github.io/CinnamonTools/lib/img/QuickMenu-002.png \"Image featuring different icons for each sub-menu and different icon sizes\")" if for_readme else "",
    ])


# The real content of the HELP file.
def get_content_extra():
    return md("{}".format("\n".join([
        "## %s" % _("Applet usage"),
        "- " + _("Menu items to .desktop files will be displayed with the icon and name declared inside the .desktop files themselves."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _(
            "The menu can be kept open while activating menu items by pressing [[Ctrl]] + **Left click** or with **Middle click**."),
        "## %s" % _("How to set a different icon for each sub-menu"),
        "",
        "- %s" %
        _("Create a file at the same level as the folders that will be used to create the sub-menus."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The file name can be customized, doesn't need to have an extension name and can be a hidden file (a dot file). By default is called **0_icons_for_sub_menus.json**."),
        "- %s" %
        _("Whatever name is chosen for the file, it will be automatically ignored and will never be shown on the menu."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The path to the icon has to be a full path. A path starting with **~/** can be used and will be expanded to the user's home folder."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("If any sub-folder has more folders that need to have custom icons, just create another **0_icons_for_sub_menus.json** file at the same level that those folders."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("The content of the file is a *JSON object* and has to look as follows:"),
        "",
        """```
{0}
{1}
{2}
```""".format("{",
              "\n".join([
                  "    {0} #1\": \"{1} #1\"".format(_("Folder name"), _(
                      "Icon name or icon path for Folder name")),
                  "    {0} #2\": \"{1} #2\"".format(_("Folder name"), _(
                      "Icon name or icon path for Folder name")),
                  "    {0} #3\": \"{1} #3\"".format(_("Folder name"), _(
                      "Icon name or icon path for Folder name")),
                  "    {0} #n\": \"{1} #n\"".format(_("Folder name"), _(
                      "Icon name or icon path for Folder name"))
              ]),
              "}"),
        "",
        "**%s** %s" % (_("Warning!!!"),
                       # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                       _("JSON *language* is very strict. Just be sure to ONLY use double quotes. And the last key/value combination DOESN'T have to end with a comma (**Folder name #n** in the previous example).")),
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

            if current_language == "en":
                localized_help_modules.create_readme(
                    xlet_dir=XLET_DIR,
                    xlet_meta=xlet_meta,
                    content_base=get_content_base(for_readme=True)
                )

            if current_language != "en" and _("language-name") == "language-name":
                # If the endonym isn't provided, assume that the HELP file isn't translated.
                # Placed this comment here so the comment isn't extracted by xgettext.
                continue

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

        localized_help_modules.save_file(path=self.help_file_path,
                                         data=html_doc,
                                         creation_type=self.creation_type)

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
