#!/usr/bin/python3

import os
import sys
import gi
import subprocess

gi.require_version("Gtk", "3.0")

from gi.repository import GLib, Gtk, Gio, Gdk
from . import ansi_colors
from subprocess import Popen

Ansi = ansi_colors.ANSIColors()
env = os.environ.copy()

MORE_FREQUENT = {
    "title": "More frequent",
    "sections": [{
        "title": "Update POT files",
        "position": 0,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Update POT files",
                "arguments": "--update-pot-files"
            }
        }]
    }, {
        "title": "Localized help files creation",
        "position": 1,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Create localized help",
                "arguments": "--create-localized-help"
            }
        }]
    }, {
        "title": "Translation statistics generation",
        "position": 2,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Generate translation statistics",
                "arguments": "--generate-trans-stats"
            }
        }]
    }, {
        "title": "Changelogs creation",
        "position": 3,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Create changelogs",
                "arguments": "--create-changelogs"
            }
        }]
    }, {
        "title": "Package creation",
        "position": 4,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Create packages",
                "arguments": "--create-packages"
            }
        }]
    }]
}

LESS_FREQUENT = {
    "title": "Less frequent",
    "sections": [{
        "title": "Metadata file generation",
        "position": 0,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Generate metadata file",
                "arguments": "--generate-meta-file"
            }
        }]
    }, {
        "title": "Xlets comparison",
        "position": 1,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Compare all xlets",
                "arguments": "--compare-xlets"
            }
        }, {
            "type": "button",
            "args": {
                "label": "Compare applets",
                "arguments": "--compare-applets"
            }
        }, {
            "type": "button",
            "args": {
                "label": "Compare extensions",
                "arguments": "--compare-extensions"
            }
        }]
    }, {
        "title": "Check or set execution permission of .sh and .py files",
        "position": 2,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Check executables",
                "arguments": "--check-executable"
            }
        }, {
            "type": "button",
            "args": {
                "label": "Set executables",
                "arguments": "--check-executable --set-executable"
            }
        }]
    }, {
        "title": "Main site rendering",
        "position": 3,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Render main site",
                "arguments": "--render-main-site"
            }
        }]
    }, {
        "title": "Repository's wiki cloning",
        "position": 4,
        "widgets": [{
            "type": "button",
            "args": {
                "label": "Clone wiki",
                "arguments": "--clone-wiki"
            }
        }]
    }]
}


def display_warning_message(widget, title, message, transient_for=None):
    dialog = Gtk.MessageDialog(transient_for=transient_for,
                               title=title,
                               modal=True,
                               message_type=Gtk.MessageType.WARNING,
                               buttons=Gtk.ButtonsType.OK)

    # try:
    #     esc = cgi.escape(message)
    # except:
    esc = message

    dialog.set_markup(esc)
    dialog.show_all()
    dialog.run()
    dialog.destroy()


class BaseGrid(Gtk.Grid):

    def __init__(self, tooltip="", orientation=Gtk.Orientation.VERTICAL):
        Gtk.Grid.__init__(self)
        self.set_orientation(orientation)
        self.set_tooltip_text(tooltip)

    def set_spacing(self, col, row):
        self.set_column_spacing(col)
        self.set_row_spacing(row)


class SectionContainer(Gtk.Frame):

    def __init__(self, title, warning_message=None):
        Gtk.Frame.__init__(self)
        self.set_shadow_type(Gtk.ShadowType.IN)

        self.box = BaseGrid()
        self.box.set_border_width(0)
        self.box.set_property("margin", 0)
        self.box.set_spacing(0, 0)
        self.add(self.box)

        toolbar = Gtk.Toolbar()
        Gtk.StyleContext.add_class(Gtk.Widget.get_style_context(toolbar), "cs-header")

        label = Gtk.Label()
        label.set_markup("<b>%s</b>" % title)
        title_holder = Gtk.ToolItem()
        title_holder.add(label)
        toolbar.add(title_holder)

        dummy = BaseGrid()
        dummy.set_property("hexpand", True)
        dummy.set_property("vexpand", False)
        dummy_holder = Gtk.ToolItem()
        dummy_holder.set_expand(True)
        dummy_holder.add(dummy)
        toolbar.add(dummy_holder)

        if warning_message is not None:
            # Using set_image on button adds an un-removable padding.
            # Setting the image as argument doesn't. ¬¬
            button = Gtk.Button(image=Gtk.Image.new_from_icon_name(
                "dialog-warning-symbolic", Gtk.IconSize.BUTTON))
            button.get_style_context().add_class("cinnamon-tools-section-warning-button")
            button.set_relief(Gtk.ReliefStyle.NONE)
            button.set_tooltip_text("Warnings related to this specific section")
            button.connect("clicked", display_warning_message, title, warning_message)
            button_holder = Gtk.ToolItem()
            button_holder.add(button)
            toolbar.add(button_holder)

        self.box.attach(toolbar, 0, 0, 2, 1)

        self.need_separator = False

    def add_row(self, widget, col_pos, row_pos, col_span, row_span):
        list_box = Gtk.ListBox()
        list_box.set_selection_mode(Gtk.SelectionMode.NONE)
        row = Gtk.ListBoxRow()
        row.add(widget)

        if self.need_separator:
            list_box.add(Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL))

        list_box.add(row)

        self.box.attach(list_box, col_pos, row_pos, col_span, row_span)

        self.need_separator = True


class Widgets():

    def button(self, working_directory, arguments, label, tooltip=""):
        self.working_directory = working_directory
        box = BaseGrid(orientation=Gtk.Orientation.HORIZONTAL)
        box.set_spacing(10, 10)

        button = Gtk.Button(label)
        button.set_property("expand", True)
        button.set_tooltip_text(tooltip)
        button.connect("clicked", self.on_button_clicked, arguments)
        box.attach(button, 0, 0, 2, 1)
        return box

    def on_button_clicked(self, widget, arguments):
        try:
            # Passing a list instead of a string is the recommended.
            # I would do so if it would freaking work!!!
            # Always one step forward and two steps back with Python!!!
            po = Popen("./helper.py" + " " + arguments,
                       shell=True,
                       stdout=subprocess.PIPE,
                       stdin=subprocess.PIPE,
                       universal_newlines=True,
                       env=env,
                       cwd=self.working_directory)

            po.wait()

            output, error_output = po.communicate()

            if po.returncode:
                print(Ansi.ERROR(error_output))
            else:
                print(Ansi.INFO(output))
        except OSError as err:
            print(Ansi.ERROR("Execution failed"), err, file=sys.stderr)


def populate_box(app):
    pages_object = [
        MORE_FREQUENT,
        LESS_FREQUENT
    ]

    stack = app.window.stack
    stack.set_transition_type(Gtk.StackTransitionType.SLIDE_UP_DOWN)
    stack.set_transition_duration(150)
    stack.set_property("margin", 0)
    stack.set_property("expand", True)

    def _make_items_sidebar(text):
        lbl = Gtk.Label(label=text, xalign=0.0)
        lbl.set_name("row")
        row = Gtk.ListBoxRow()
        row.get_style_context().add_class("cinnamon-tools-category")
        row.add(lbl)
        return row

    for page_obj in pages_object:
        page = BaseGrid()
        page.set_spacing(15, 15)
        page.set_property("expand", True)
        page.set_property("margin-left", 15)
        page.set_property("margin-right", 15)
        page.set_property("margin-bottom", 15)
        page.set_border_width(0)

        section_count = 0
        for section_obj in sorted(page_obj["sections"], key=lambda x: x["position"]):
            try:
                warning_message = section_obj["warning_message"]
            except KeyError:  # If "warning_message" key isn't set.
                warning_message = None

            section_container = SectionContainer(
                section_obj["title"], warning_message=warning_message)

            SECTION_WIDGETS = section_obj["widgets"]

            for i in range(0, len(SECTION_WIDGETS)):
                section_widget_obj = SECTION_WIDGETS[i]

                widget_obj = getattr(Widgets, section_widget_obj["type"])
                widget = widget_obj(Widgets(), **section_widget_obj["args"],
                                    working_directory=app.root_path)
                widget.set_border_width(5)
                widget.set_margin_left(15)
                widget.set_margin_right(15)

                section_container.add_row(widget, 0, i + 1, 1, 1)

            page.attach(section_container, 0, section_count, 2, 1)
            section_count += 1

        scrolledwindow = Gtk.ScrolledWindow(hadjustment=None, vadjustment=None)
        scrolledwindow.set_size_request(width=-1, height=-1)
        scrolledwindow.set_policy(hscrollbar_policy=Gtk.PolicyType.AUTOMATIC,
                                  vscrollbar_policy=Gtk.PolicyType.AUTOMATIC)
        scrolledwindow.add(page)
        sidebar_row = _make_items_sidebar(page_obj["title"])
        app.window.sidebar.add(sidebar_row)
        stack.add_named(scrolledwindow, page_obj["title"])


class XletsHelperWin(Gtk.ApplicationWindow):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.set_default_size(800, 500)

        self.set_position(Gtk.WindowPosition.CENTER)
        self.set_icon_name("dialog-warning")

        main_box = BaseGrid(orientation=Gtk.Orientation.HORIZONTAL)

        left_box = self.create_sidebar()
        right_box = self.main_content()

        main_box.attach(left_box, 0, 0, 1, 1)
        main_box.attach(Gtk.Separator(orientation=Gtk.Orientation.VERTICAL), 1, 0, 1, 1)
        main_box.attach(right_box, 2, 0, 1, 1)

        self.load_css()

        self.add(main_box)

    def _on_select_row(self, listbox, row):
        if row:
            group = row.get_child().get_text()
            self.stack.set_visible_child_name(group)

    def load_css(self):
        css_provider = Gtk.CssProvider()
        # css_provider.load_from_path(
        #     os.path.join(EXTENSION_DIR, "stylesheet.css"))
        # Loading from data so I don't have to deal with a style sheet file
        # with just a couple of lines of code.
        css_provider.load_from_data(str.encode(
            """
            .cinnamon-tools-category:not(:selected):not(:hover),
            .cinnamon-tools-categories {
                background-color: @theme_bg_color;
            }
            .cinnamon-tools-category {
                font-weight: bold;
                padding: 10px;
            }
            .cinnamon-tools-section-warning-button:hover,
            .cinnamon-tools-section-warning-button {
                /*-GtkButton-default-border : 0;
                -GtkButton-default-outside-border : 0;
                -GtkButton-inner-border: 0;
                -GtkWidget-focus-line-width : 0;
                -GtkWidget-focus-padding : 0;*/
                padding: 0;
            }
            """
        ))

        screen = Gdk.Screen.get_default()
        context = Gtk.StyleContext()
        context.add_provider_for_screen(screen, css_provider,
                                        Gtk.STYLE_PROVIDER_PRIORITY_USER)

    def main_content(self):
        right_box = BaseGrid(orientation=Gtk.Orientation.VERTICAL)

        self.stack = Gtk.Stack()
        toolbar = self.toolbar()

        right_box.attach(toolbar, 0, 0, 1, 1)
        right_box.attach(self.stack, 0, 1, 1, 1)

        return right_box

    def create_sidebar(self):
        left_box = BaseGrid()
        left_box.set_property("margin", 0)

        self.sidebar = Gtk.ListBox()
        self.sidebar.get_style_context().add_class("cinnamon-tools-categories")
        self.sidebar.set_size_request(150, -1)
        self.sidebar.set_property("vexpand", True)
        self.sidebar.connect("row-selected", self._on_select_row)
        self.sidebar.set_header_func(self._list_header_func, None)

        scroll = Gtk.ScrolledWindow()
        scroll.set_policy(Gtk.PolicyType.NEVER,
                          Gtk.PolicyType.AUTOMATIC)
        scroll.add(self.sidebar)

        left_box.attach(scroll, 0, 0, 1, 1)

        return left_box

    def _list_header_func(self, row, before, user_data):
        if before and not row.get_header():
            row.set_header(Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL))

    def toolbar(self):
        box = BaseGrid(orientation=Gtk.Orientation.HORIZONTAL)
        box.set_property("hexpand", True)
        box.set_property("vexpand", False)
        box.set_property("margin", 15)
        return box


class XletsHelperApp(Gtk.Application):

    def __init__(self, root_path, *args, **kwargs):
        GLib.set_application_name("Cinnamon Tools Helper")
        super().__init__(*args,
                         application_id="org.cinnamon.cinnamon-tools-repository-helper",
                         flags=Gio.ApplicationFlags.FLAGS_NONE,
                         **kwargs)

        self.root_path = root_path
        self.application = Gtk.Application()
        self.application.connect("activate", self.do_activate)
        self.application.connect("startup", self.do_startup)

    def do_activate(self, data=None):
        self.window.present()

    def do_startup(self, data=None):
        Gtk.Application.do_startup(self)
        self._buildUI()

    def _buildUI(self):
        self.window = XletsHelperWin(
            application=self, title="Cinnamon Tools Helper")

        self.window.connect("destroy", self.on_quit)

        populate_box(self)

        self.window.show_all()

    def on_quit(self, action):
        self.quit()
