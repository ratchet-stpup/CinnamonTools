#!/usr/bin/python3

import gi

gi.require_version("Gtk", "3.0")
gi.require_version("Vte", "2.91")
from gi.repository import Gio, Gtk, GLib, Vte


APPLICATION_ID = "org.cinnamon.applets.odyseus.terminal-for-"


class InfoLabel(Gtk.Label):

    def __init__(self, text=None, markup=None):
        Gtk.Label.__init__(self)
        if text:
            self.set_label(text)

        if markup:
            self.set_markup(markup)

        self.set_property("xpad", 5)
        self.set_alignment(0.0, 0.5)
        self.set_line_wrap(True)

    def set_label_text(self, text):
        self.set_label(text)

    def set_label_markup(self, markup):
        self.set_markup(markup)


class TerminalWin(Gtk.ApplicationWindow):

    def __init__(self, app_title="", app_command=None, working_directory=None,
                 app_info_label=None, sub_id="", btn_label="Press", *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.app_title = app_title
        self.app_command = app_command + "\n"
        self.working_directory = working_directory
        self.app_info_label = app_info_label
        self.sub_id = sub_id

        self.set_position(Gtk.WindowPosition.CENTER)
        self.set_icon_name("dialog-warning")
        self.set_default_size(640, 400)
        # Vte.Terminal handling based on:
        # http://stackoverflow.com/a/25265794/4147432
        self.terminal = Vte.Terminal()
        self.terminal.spawn_sync(
            Vte.PtyFlags.DEFAULT,  # pty_flags
            self.working_directory,  # working_directory
            ["/bin/bash"],  # argv
            [],  # envv
            GLib.SpawnFlags.DO_NOT_REAP_CHILD,  # spawn_flags
            None,  # child_setup
            None,  # child_setup_data
            None,  # cancellable
        )

        # Set up a button to click and run the command
        self.button = Gtk.Button(btn_label)
        self.button.connect("clicked", self.input_to_term)

        grid = Gtk.Grid(orientation=Gtk.Orientation.VERTICAL)
        grid.attach(self.button, 0, 0, 1, 1)

        if self.app_info_label:
            info_label = InfoLabel(markup="<b><i>%s</i></b>" % self.app_info_label)
            grid.attach(info_label, 0, 1, 1, 1)

        scroller = Gtk.ScrolledWindow()
        scroller.set_hexpand(True)
        scroller.set_vexpand(True)
        scroller.add(self.terminal)
        grid.attach(scroller, 0, 2, 1, 1)
        self.add(grid)

    def input_to_term(self, clicker):
        length = len(self.app_command)
        self.terminal.feed_child(self.app_command, length)


class TerminalApp(Gtk.Application):

    def __init__(self, app_title="", app_command=None, working_directory=None,
                 app_info_label=None, sub_id="", *args, **kwargs):
        self.app_title = app_title
        self.app_command = app_command
        self.working_directory = working_directory
        self.app_info_label = app_info_label
        self.sub_id = sub_id

        if self.app_title:
            GLib.set_application_name(self.app_title)

        super().__init__(*args,
                         application_id=APPLICATION_ID + self.sub_id,
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
        try:
            self.window = TerminalWin(application=self,
                                      title=self.app_title if self.app_title else "",
                                      app_command=self.app_command)
        except Exception as detail:
            print(detail)

        self.window.app_title = self.app_title if self.app_title else ""
        self.window.working_directory = self.working_directory if self.working_directory else None
        self.window.app_info_label = self.app_info_label if self.app_info_label else None
        self.window.sub_id = self.sub_id if self.sub_id else ""

        self.window.connect("destroy", self.on_quit)
        self.window.show_all()

        self.window.input_to_term(None)

    def on_quit(self, action):
        self.quit()
