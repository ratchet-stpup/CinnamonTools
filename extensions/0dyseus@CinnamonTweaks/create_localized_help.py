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

        "## %s" % _("Extension options details"),
        "<span style=\"color:red;font-weight: bold;font-size: large;\">",
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Some tweaks have warnings, dependencies, limitations and or known issues that must be read and understood before a tweak is enabled. No worries, nothing *fatal* could ever happen."),
        "</span>",
        "### %s" % _("Applets/Desklets tweaks"),
        "- **%s** %s" % (_("Ask for confirmation on applet/desklet removal:"), _(
            "Instead of directly remove the applet/desklet from the context menus, it will ask for confirmation. This option doesn't affect the removal of applets/desklets from the Applets/Desklets manager in Cinnamon settings (there will be no confirmation).")),
        "- **%s** & **%s** %s" % (_("Display \"Open applet/desklet folder\" on context menu for applets/desklets"), _("Display \"Edit applet/desklet main file\" on context menu for applets/desklet:"),
                                  # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                                  _("These options will add new menu items to the applets/desklets context menus. The place where this items will be located is chosen by the option **Where to place the menu item?**.")),
        "\n",
        "### %s" % _("Hot Corners tweaks"),
        _("This tweak is only available for Cinnamon versions lower than 3.2. Cinnamon 3.2.x already has hot corners delay activation."),
        "- **%s** %s" % (_("Top left hot corner activation delay:"), _("Crystal clear.")),
        "- **%s** %s" % (_("Top right hot corner activation delay:"), _("Crystal clear.")),
        "- **%s** %s" % (_("Bottom left hot corner activation delay:"), _("Crystal clear.")),
        "- **%s** %s" % (_("Bottom right hot corner activation delay:"), _("Crystal clear.")),
        "\n",
        "### %s" % _("Desktop area tweaks"),
        "- **%s** %s" % (_("Enable applications drop to the Desktop:"), _(
            "This tweak enables the ability to drag and drop applications from the menu applet and from the panel launchers applet into the desktop.")),
        "\n",
        "### %s" % _("Popup menus tweaks"),
        "##### %s" % _("Panel menus behavior"),
        "**%s** %s" % (_("Note:"), _(
            "This setting affects only the behavior of menus that belongs to applets placed on any panel.")),
        "\n",
        "- **%s** %s" % (_("Emulate Gnome Shell behavior:"), _("When a menu is open on Genome Shell, and then the mouse cursor is moved to another button on the top panel, the menu of the hovered buttons will automatically open without the need to click on them. With this option enabled, that same behavior can be reproduced on Cinnamon.")),
        "- **%s** %s" % (_("Don't eat clicks:"), _("By default, when one opens an applet's menu on Cinnamon and then click on another applet to open its menu, the first click is used to close the first opened menu, and then another click has to be performed to open the menu of the second applet. With this option enabled, one can directly open the menu of any applet even if another applet has its menu open.")),
        "\n",
        "### %s" % _("Tooltips tweaks"),
        "- **%s** %s" % (_("Avoid mouse pointer overlapping tooltips:"), _("Tooltips on Cinnamon's UI are aligned to the top-left corner of the mouse pointer. This leads to having tooltips overlapped by the mouse pointer. This tweak aligns the tooltip to the bottom-right corner of the mouse pointer (approximately), reducing the possibility of the mouse pointer to overlap the tooltip. This tweak is only available for Cinnamon versions lower than 3.2. Cinnamon 3.2.x already has the position of the tooltips changed.")),
        "- **%s** %s" % (_("Tooltips show delay:"), _("Crystal clear.")),
        "\n",
        "### %s" % _("Notifications tweaks"),
        "- **%s** %s" % (_("Enable notifications open/close animation:"), _("Crystal clear.")),
        "- **%s** %s" % (_("Notifications position:"), _(
            "Notifications can be displayed at the top-right of screen (system default) or at the bottom-right of screen.")),
        "- **%s**" % (_("Distance from panel:")),
        "    - **%s** %s" % (_("For notifications displayed at the top-right of screen:"), _(
            "This is the distance between the bottom border of the top panel (if no top panel, from the top of the screen) to the top border of the notification popup.")),
        "    - **%s** %s" % (_("For notifications displayed at the bottom-right of screen:"), _(
            "This is the distance between the top border of the bottom panel (if no bottom panel, from the bottom of the screen) to the bottom border of the notification popup.")),
        "- **%s** %s" % (_("Notification popup right margin:"), _(
            "By default, the right margin of the notification popup is defined by the currently used theme. This option, set to any value other than 0 (zero), allows to set a custom right margin, ignoring the defined by the theme.")),
        "\n",
        "### %s" % _("Window focus tweaks"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Tweak based on the gnome-shell extension called [Steal My Focus](https://github.com/v-dimitrov/gnome-shell-extension-stealmyfocus) by [Valentin Dimitrov](https://github.com/v-dimitrov) and another gnome-shell extension called [Window Demands Attention Shortcut](https://github.com/awamper/window-demands-attention-shortcut) by [awamper](https://github.com/awamper)."),
        "\n",
        _("Some windows that demands attention will not gain focus regardless of the settings combination on Cinnamon settings. This option will allow you to correct that."),
        "\n",
        "- **%s**" % _("The activation of windows demanding attention...:"),
        "    - **%s** %s" % (_("...is handled by the system:"), _("Crystal clear.")),
        "    - **%s** %s" % (_("...is immediate:"),
                             _("will force windows demanding attention to be focused immediately.")),
        "    - **%s** %s" % (_("...is performed with a keyboard shortcut:"),
                             _("will focus windows demanding attention with a keyboard shortcut.")),
        "- **%s** %s" % (_("Keyboard shortcut:"),
                         _("Set a keyboard shortcut for the option **...is performed with a keyboard shortcut**.")),
        "\n",
        "### %s" % _("Window Shadows tweaks"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Tweak based on a Cinnamon extension called [Custom Shadows](https://cinnamon-spices.linuxmint.com/extensions/view/43) created by [mikhail-ekzi](https://github.com/mikhail-ekzi). It allows to modify the shadows used by Cinnamon's window manager (Muffin)."),
        "\n",
        "**%s** %s" % (_("Note:"), _("Client side decorated windows aren't affected by this tweak.")),
        "\n",
        "##### %s" % _("Shadow presets"),
        "- **%s**" % _("Custom shadows"),
        "- **%s**" % _("Default shadows"),
        "- **%s**" % _("No shadows"),
        "- **%s**" % _("Windows 10 shadows"),
        "\n",
        "### %s" % _("Auto move windows"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Tweak based on the gnome-shell extension called [Auto Move Windows](https://extensions.gnome.org/extension/16/auto-move-windows/) by [Florian Muellner](https://github.com/fmuellner). It enables the ability to set rules to open determined applications on specific workspaces."),
        "\n",
        "**%s** %s" % (_("Note:"),
                       # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                       _("If the application that you want to select doesn't show up on the application chooser dialog, read the section on this help file called **Applications not showing up on the applications chooser dialogs**.")),
        "### %s" % _("Windows decorations removal"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("Tweak based on the extension called [Cinnamon Maximus](https://cinnamon-spices.linuxmint.com/extensions/view/29) by [Fatih Mete](https://github.com/fatihmete) with some options from the gnome-shell extension called [Maximus NG](https://github.com/luispabon/maximus-gnome-shell) by [Luis Pabon](https://github.com/luispabon). This tweak allows to remove the windows decorations from maximized/half-maximized/tiled windows."),
        "\n",
        "**%s** %s" % (_("Note:"),
                       # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                       _("If the application that you want to select doesn't show up on the application chooser dialog, read the section on this help file called **Applications not showing up on the applications chooser dialogs**.")),
        "#### %s" % _("Dependencies"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("This tweak requires two commands available on the system (**xprop** and **xwininfo**) for it to work."),
        "- %s %s" % (_("Debian based distributions:"),
                     # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                     _("These commands are provided by the **x11-utils** package. Linux Mint already has this package installed.")),
        "- %s %s" % (_("Archlinux based distributions:"),
                     # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                     _("These commands are provided by the **xorg-xprop** and **xorg-xwininfo** packages.")),
        "- %s %s" % (_("Fedora based distributions:"),
                     # TO TRANSLATORS: MARKDOWN string. Respect formatting.
                     _("These commands are provided by the **xorg-x11-utils** package.")),
        "\n",
        "#### %s" % _("Warnings"),
        "- %s" % _("Client side decorated windows and WINE applications aren't affected by this tweak."),
        "- %s" % _("Close all windows that belongs to an application that is going to be added to the applications list and before applying the settings of this tweak."),
        "- %s" % _("As a general rule to avoid issues, before enabling and configuring this tweak, close all windows currently opened, enable and configure this tweak and then log out and log back in."),
        "\n",
        "#### %s" % _("Known issues"),
        "- **%s** %s" % (_("Invisible windows:"), _("Sometimes, windows of applications that are configured to remove their decorations can become invisible. The application's icon can still be seen in the panel (taskbar) and when clicked to focus its respective window, the invisible window will block the clicks as if it were visible. To fix this, the window needs to be unmaximized (it will become visible again) and then closed. When reopened, the window should behave normally.")),
        "- **%s** %s" % (_("Applications stuck undecorated:"), _(
            "Some times, an application will get stuck undecorated even after unmaximizing it. Restarting the application will recover its ability to decorate and undecorate itself.")),
        "\n",
        "#### %s" % _("Alternative"),
        _("There is an alternative way of hiding the title bar of absolutely all maximized windows without exceptions. By editing your Metacity theme (window decorations theme). It works infinitely better and without any of the issues this tweak on this extension has."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("Simply go to `/Path/To/Your/Theme/metacity-1` folder and edit with any text editor the file called **metacity-theme-3.xml**. If that file doesn't exists in your theme, then it should exist one called **metacity-theme-2.xml** or **metacity-theme-1.xml**. Choose the one with the bigger number."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("Find the **frame_geometry** element named **max** (or **maximized** or **normal_max** or **normal_maximized**). Its exact name may vary depending on the theme."),
        "- %s" % _("Basically, one has to set to that element the attribute **has_title** to false, and then set all sizes of all its properties to 0 (zero). Some themes might require to add more properties and set them to 0 (zero) to completely get rid of the title bar."),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        "- %s" % _("Next you will find examples on how to edit the Metacity themes found on the **Mint-X** and **Mint-Y** themes."),
        "\n",
        "##### %s" % _("For the Metacity theme found on the Mint-X theme"),
        """
```xml
<frame_geometry name="maximized" has_title="false" title_scale="medium" parent="normal" rounded_top_left="false" rounded_top_right="false">
    <distance name="right_width" value="0" />
    <distance name="left_titlebar_edge" value="0"/>
    <distance name="right_titlebar_edge" value="0"/>
    <distance name="title_vertical_pad" value="0"/>
    <border name="title_border" left="0" right="0" top="0" bottom="0"/>
    <border name="button_border" left="0" right="0" top="0" bottom="0"/>
    <distance name="bottom_height" value="0" />
</frame_geometry>
```
""",
        "\n",
        "##### %s" % _("For the Metacity theme found on Mint-Y theme"),
        """
```xml
<frame_geometry name="max" has_title="false" title_scale="medium" parent="normal" rounded_top_left="false" rounded_top_right="false">
    <distance name="right_width" value="0" />
    <distance name="left_titlebar_edge" value="0"/>
    <distance name="right_titlebar_edge" value="0"/>
    <distance name="title_vertical_pad" value="0"/>
    <border name="title_border" left="0" right="0" top="0" bottom="0"/>
    <border name="button_border" left="0" right="0" top="0" bottom="0"/>
    <distance name="bottom_height" value="0" />
    <distance name="button_width" value="0"/>
    <distance name="button_height" value="0"/>
</frame_geometry>
```
""",
        "\n",
        "***",
        "## %s" % _("General extension issues"),
        "### %s" % _("Applications not showing up on the applications chooser dialogs"),
        # TO TRANSLATORS: MARKDOWN string. Respect formatting.
        _("The application chooser dialog used by the settings window of this extension lists only those applications that have available .desktop files. Simply because these applications are the only ones that any of the tweaks that require an application ID (**Auto move windows** and **Windows decorations removal**) will recognize and handle."),
        "\n",
        _("Following the [Desktop Entry Specification](https://specifications.freedesktop.org/desktop-entry-spec/latest/index.html), one can create a .desktop file for any application that doesn't appear in the applications list."),
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
