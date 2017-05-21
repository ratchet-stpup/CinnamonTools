#!/usr/bin/python3

import gi

gi.require_version("Gtk", "3.0")

from gi.repository import GLib, Gtk, Gio, Gdk


class BaseGrid(Gtk.Grid):

    def __init__(self, tooltip="", orientation=Gtk.Orientation.VERTICAL):
        Gtk.Grid.__init__(self)
        self.set_orientation(orientation)
        self.set_tooltip_text(tooltip)

    def set_spacing(self, col, row):
        self.set_column_spacing(col)
        self.set_row_spacing(row)


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
            .cinnamon-tweaks-category:not(:selected):not(:hover),
            .cinnamon-tweaks-categories {
                background-color: @theme_bg_color;
            }
            .cinnamon-tweaks-category {
                font-weight: bold;
                padding: 10px;
            }
            .cinnamon-tweaks-section-warning-button:hover,
            .cinnamon-tweaks-section-warning-button {
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
        self.sidebar.get_style_context().add_class("cinnamon-tweaks-categories")
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

    def __init__(self, *args, **kwargs):
        GLib.set_application_name("Cinnamon Tools Helper")
        super().__init__(*args,
                         application_id="org.cinnamon.cinnamon-tools-repository-helper",
                         flags=Gio.ApplicationFlags.FLAGS_NONE,
                         **kwargs)

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

        # populate_settings_box()

        self.window.show_all()

    def on_quit(self, action):
        self.quit()
