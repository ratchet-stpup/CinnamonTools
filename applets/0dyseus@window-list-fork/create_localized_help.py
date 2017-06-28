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
        _("This applet is a fork of the default Window list applet shipped with Cinnamon."),
        "",
        "## %s" % _("Differences with the original applet"),
        "",
        "- %s" % _("Added option to remove the label from the window list buttons."),
        "- %s" % _("Added option to remove the tooltips from the window list buttons."),
        "- %s" % _("Added icons to the window list button's context menu."),
        "- %s" % _("Added option to invert the contex menu items."),
        "- %s" % _("Added option to hide/move the **Preferences** sub menu."),
        "",
        "## Inverted menu on top panel" if for_readme else "",
        "",
        "![Inverted menu on top panel](https://odyseus.github.io/CinnamonTools/lib/img/window-list-fork-001.png \"Inverted menu on top panel\")" if for_readme else "",
    ])


# The real content of the HELP file.
def get_content_extra():
    return ""
    # Example
    # return "{}".format("\n".join([
    #     _("Help"),
    #     _("About..."),
    #     _("Configure..."),
    #     _("Cancel")
    # ])
    # )


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
