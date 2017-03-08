#!/usr/bin/python3

import os
import gettext
import sys
import json
import cgi
import gi
gi.require_version("Gtk", "3.0")
from gi.repository import Gio, Gtk, GObject, GLib

gettext.install("cinnamon", "/usr/share/locale")

HOME = os.path.expanduser("~")
EXTENSION_DIR = os.path.dirname(os.path.abspath(__file__))
EXTENSION_UUID = str(os.path.basename(EXTENSION_DIR))
SCHEMA_NAME = "org.cinnamon.extensions.MultiTranslatorExtension"
SCHEMA_PATH = "/org/cinnamon/extensions/MultiTranslatorExtension/"
TRANSLATIONS = {}


def _(string):
    # check for a translation for this xlet
    if EXTENSION_UUID not in TRANSLATIONS:
        try:
            TRANSLATIONS[EXTENSION_UUID] = gettext.translation(
                EXTENSION_UUID, HOME + "/.local/share/locale").gettext
        except IOError:
            try:
                TRANSLATIONS[EXTENSION_UUID] = gettext.translation(
                    EXTENSION_UUID, "/usr/share/locale").gettext
            except IOError:
                TRANSLATIONS[EXTENSION_UUID] = None

    # do not translate white spaces
    if not string.strip():
        return string

    if TRANSLATIONS[EXTENSION_UUID]:
        result = TRANSLATIONS[EXTENSION_UUID](string)

        try:
            result = result.decode("utf-8")
        except:
            result = result

        if result != string:
            return result
    return gettext.gettext(string)

LANGUAGES_LIST = {
    "auto": _("Detect language"),
    "af": _("Afrikaans"),
    "am": _("Amharic"),
    "ar": _("Arabic"),
    "az": _("Azerbaijani"),
    "be": _("Belarusian"),
    "bg": _("Bulgarian"),
    "bn": _("Bengali"),
    "bs": _("Bosnian (Y)"),
    "ca": _("Catalan"),
    "ceb": _("Chichewa"),
    "co": _("Corsican"),
    "cs": _("Czech"),
    "cy": _("Welsh"),
    "da": _("Danish"),
    "de": _("German"),
    "el": _("Greek"),
    "en": _("English"),
    "eo": _("Esperanto"),
    "es": _("Spanish"),
    "et": _("Estonian"),
    "eu": _("Basque"),
    "fa": _("Persian"),
    "fi": _("Finnish"),
    "fr": _("French"),
    "fy": _("Frisian"),
    "ga": _("Irish"),
    "gd": _("Scots Gaelic"),
    "gl": _("Galician"),
    "gu": _("Gujarati"),
    "ha": _("Hausa"),
    "haw": _("Hawaiian"),
    "he": _("Hebrew (Y)"),
    "hi": _("Hindi"),
    "hmn": _("Hmong"),
    "hr": _("Croatian"),
    "ht": _("Haitian Creole"),
    "hu": _("Hungarian"),
    "hy": _("Armenian"),
    "id": _("Indonesian"),
    "ig": _("Igbo"),
    "is": _("Icelandic"),
    "it": _("Italian"),
    "iw": _("Hebrew"),
    "ja": _("Japanese"),
    "jw": _("Javanese"),
    "ka": _("Georgian"),
    "kk": _("Kazakh"),
    "km": _("Khmer"),
    "kn": _("Kannada"),
    "ko": _("Korean"),
    "ku": _("Kurdish (Kurmanji)"),
    "ky": _("Kyrgyz"),
    "la": _("Latin"),
    "lb": _("Luxembourgish"),
    "lo": _("Lao"),
    "lt": _("Lithuanian"),
    "lv": _("Latvian"),
    "mg": _("Malagasy"),
    "mi": _("Maori"),
    "mk": _("Macedonian"),
    "ml": _("Malayalam"),
    "mn": _("Mongolian"),
    "mr": _("Marathi"),
    "ms": _("Malay"),
    "mt": _("Maltese"),
    "my": _("Myanmar (Burmese)"),
    "ne": _("Nepali"),
    "nl": _("Dutch"),
    "no": _("Norwegian"),
    "ny": _("Cebuano"),
    "pa": _("Punjabi"),
    "pl": _("Polish"),
    "ps": _("Pashto"),
    "pt": _("Portuguese"),
    "ro": _("Romanian"),
    "ru": _("Russian"),
    "sd": _("Sindhi"),
    "si": _("Sinhala"),
    "sk": _("Slovak"),
    "sl": _("Slovenian"),
    "sm": _("Samoan"),
    "sn": _("Shona"),
    "so": _("Somali"),
    "sq": _("Albanian"),
    "sr": _("Serbian"),
    "st": _("Sesotho"),
    "su": _("Sundanese"),
    "sv": _("Swedish"),
    "sw": _("Swahili"),
    "ta": _("Tamil"),
    "te": _("Telugu"),
    "tg": _("Tajik"),
    "th": _("Thai"),
    "tl": _("Filipino"),
    "tr": _("Turkish"),
    "uk": _("Ukrainian"),
    "ur": _("Urdu"),
    "uz": _("Uzbek"),
    "vi": _("Vietnamese"),
    "xh": _("Xhosa"),
    "yi": _("Yiddish"),
    "yo": _("Yoruba"),
    "zh": _("Chinese (Y)"),
    "zh-CN": _("Chinese Simplified"),
    "zh-TW": _("Chinese Traditional"),
    "zu": _("Zulu")
}

# Doesn't go anywhere
# pref-last-translator
# pref-all-dependencies-met
# pref-languages-stats


MAIN_TAB = {
    "label": _("Global"),
    "tooltip": _("Extension's global settings."),
    "widgets": [{
        "type": "combo",
        "args": {
            "key": "pref-default-translator",
            "label": _("Default translation provider"),
            "tooltip": _("Select the default translation provider.") + "\n" +
                _("Providers marked with (*) require translate-shell package to work.") + "\n" +
                _("See the extended help for this extension for more information."),
            "values": {
                "Apertium.TS": "Apertium (*)",
                "Bing.TranslatorTS": "Bing Translator (*)",
                "Google.TranslateTS": "Google Translate (*)",
                "Google.Translate": "Google Translate",
                "Transltr": "Transltr",
                "Yandex.Translate": "Yandex Translate"
            }
        }
    }, {
        "type": "switch",
        "args": {
            "key": "pref-remember-last-translator",
            "label": _("Remember last translator"),
            "tooltip": _("Remember last used translation provider.")
        }
    }, {
        "type": "switch",
        "args": {
            "key": "pref-show-most-used",
            "label": _("Show most used languages"),
            "tooltip": _("Display a list of most used languages.")
        }
    }, {
        "type": "switch",
        "args": {
            "key": "pref-sync-entries-scrolling",
            "label": _("Synchronize scroll entries"),
            "tooltip": _("Make the source and target entries scroll synchronously.")
        }
    }]
}

TRANSLATORS_TAB = {
    "label": _("Translators"),
    "tooltip": _("Set default settings for each available translation service."),
    "widgets": [{
        "type": "translators_prefs_widget",
        "args": {
            "key": "pref-translators-prefs"
        }
    }]
}

APPEARANCE_TAB = {
    "label": _("Appearance"),
    "tooltip": _("Translation dialog appearance."),
    "widgets": [{
        "type": "combo",
        "args": {
            "key": "pref-dialog-theme",
            "label": _("Dialog theme"),
            "tooltip": _("Select a theme for the translation dialog."),
            "values": {
                "custom": _("Custom"),
                "default": "Linux Mint (Default)",
                "Gnome-shell": "Gnome shell",
                "Mint-X": "Mint-X",
                "Mint-X-Aqua": "Mint-X-Aqua",
                "Mint-X-Blue": "Mint-X-Blue",
                "Mint-X-Brown": "Mint-X-Brown",
                "Mint-X-Greybird-Blue": "Mint-X-Greybird-Blue",
                "Mint-X-Orange": "Mint-X-Orange",
                "Mint-X-Pink": "Mint-X-Pink",
                "Mint-X-Purple": "Mint-X-Purple",
                "Mint-X-Red": "Mint-X-Red",
                "Mint-X-Sand": "Mint-X-Sand",
                "Mint-X-Teal": "Mint-X-Teal"
            }
        }
    }, {
        "type": "entry_path",
        "args": {
            "key": "pref-dialog-theme-custom",
            "select_dir": False,
            "label": _("Custom theme"),
            "tooltip": _("Select a custom theme for the translation dialog."),
        }
    }, {
        "type": "spin",
        "args": {
            "key": "pref-font-size",
            "label": _("Font size"),
            "tooltip": _("Select a font size for the source text and target text entries."),
            "min": 8,
            "max": 32,
            "step": 1,
            "units": "pixels"
        }
    }, {
        "type": "spin",
        "args": {
            "key": "pref-width-percents",
            "label": _("Percentage of screen width"),
            "tooltip": _("What percentage of screen width should the translation dialog fill."),
            "min": 20,
            "max": 100,
            "step": 5,
            "units": "pixels"
        }
    }, {
        "type": "spin",
        "args": {
            "key": "pref-height-percents",
            "label": _("Percentage of screen height"),
            "tooltip": _("What percentage of screen height should the translation dialog fill."),
            "min": 20,
            "max": 100,
            "step": 5,
            "units": "pixels"
        }
    }]
}

HISTORY_TAB = {
    "label": _("History"),
    "tooltip": _("Translation history settings."),
    "widgets": [{
        "type": "combo",
        "args": {
            "key": "pref-history-timestamp",
            "label": _("Timestamp for history entries"),
            "tooltip": _("Timestamp format for the translation history entries.\nNote: After changing this setting, only new entries in the translation history will be saved with the new timestamp format. Old entries will still have the previous timestamp format."),
            "values": {
                "custom": "Custom",
                "iso": "YYYY MM-DD hh:mm:ss (ISO8601)",
                "eu": "YYYY DD-MM hh:mm:ss (European)"
            }
        }
    }, {
        "type": "entry",
        "args": {
            "key": "pref-history-timestamp-custom",
            "label": _("Custom timestamp"),
            "tooltip": _("Choose a custom timestamp for the translation history entries.\nYYYY: year\nMM: month\nDD: day\nhh: hours\nmm: minutes\nss: seconds")
        }
    }, {
        "type": "spin",
        "args": {
            "key": "pref-history-initial-window-width",
            "label": _("History window initial width"),
            "min": 400,
            "max": 2048,
            "step": 50,
            "units": "pixels"
        }
    }, {
        "type": "spin",
        "args": {
            "key": "pref-history-initial-window-height",
            "label": _("History window initial height"),
            "min": 400,
            "max": 2048,
            "step": 50,
            "units": "pixels"
        }
    }, {
        "type": "spin",
        "args": {
            "key": "pref-history-width-to-trigger-word-wrap",
            "label": _("Width to trigger word wrap"),
            "tooltip": _("The \"Source text\" and \"Target text\" columns on the history window will wrap its text at the width defined by this setting."),
            "min": 100,
            "max": 1024,
            "step": 10,
            "units": "pixels"
        }
    }]
}

SHORTCUTS_TAB = {
    "label": _("Shortcuts"),
    "tooltip": _("Keyboard shortcuts settings."),
    "widgets": [{
        "type": "switch",
        "args": {
            "key": "pref-enable-shortcuts",
            "label": _("Enable shortcuts"),
            "tooltip": _("Enable/Disable the use of keyboard shortcuts.")
        }
    }, {
        "type": "keybindings_tree",
        "args": {
            "keybindings": {
                "pref-open-translator-dialog-keybinding": _("Translate hotkey"),
                "pref-translate-from-clipboard-keybinding": _("Translate from clipboard hotkey"),
                "pref-translate-from-selection-keybinding": _("Translate from selection hotkey")
            }
        }
    }]
}

YANDEX_TAB = {
    "label": _("Yandex"),
    "tooltip": _("API keys for Yandex translate provider."),
    "widgets": [{
        "type": "textview",
        "args": {
            "key": "pref-yandex-api-keys",
            "height": 150,
            "label": _("Yandex API keys"),
            "tooltip": _("Enter one API key per line.\nRead the help file found inside this extension folder to know how to get free Yandex API keys.")
        }
    }]
}

DEBUG_TAB = {
    "label": _("Debug"),
    "tooltip": _("This options are only useful for the extension developer."),
    "widgets": [{
        "type": "info_label",
        "args": {
            "label": _("This options are only useful for the extension developer."),
            "bold": True,
            "italic": True
        }
    }, {
        "type": "switch",
        "args": {
            "key": "pref-loggin-enabled",
            "label": _("Enable logging"),
            "tooltip": _("It enables the ability to log the output of several functions used by the extension.")
        }
    }, {
        "type": "switch",
        "args": {
            "key": "pref-loggin-save-history-indented",
            "label": _("Indent translation history data"),
            "tooltip": _("It allows to save the translation history data with indentation.")
        }
    }]
}


class BaseGrid(Gtk.Grid):

    def __init__(self, tooltip=""):
        Gtk.Grid.__init__(self)

        self.set_tooltip_text(tooltip)
        self.set_column_spacing(10)
        self.set_row_spacing(10)


class SettingsBox(BaseGrid):

    def __init__(self):
        BaseGrid.__init__(self)
        self.set_orientation(Gtk.Orientation.VERTICAL)
        self.set_border_width(10)

        tabs_objects = [
            MAIN_TAB,
            TRANSLATORS_TAB,
            APPEARANCE_TAB,
            HISTORY_TAB,
            SHORTCUTS_TAB,
            YANDEX_TAB,
            DEBUG_TAB
        ]

        tabs = Gtk.Notebook()
        tabs.set_scrollable(True)
        tabs.set_size_request(100, 100)

        for tab_obj in tabs_objects:
            tab = BaseGrid()
            tab.set_orientation(Gtk.Orientation.VERTICAL)
            tab.set_border_width(10)
            tab.set_column_spacing(10)
            tab.set_row_spacing(10)
            tab_label = Gtk.Label(label=tab_obj["label"])
            tab_label.set_tooltip_text(tab_obj["tooltip"])

            for i in range(0, len(tab_obj["widgets"])):
                tab_widget = tab_obj["widgets"][i]
                widget_obj = getattr(Widgets, tab_widget["type"])
                widget = widget_obj(Widgets(), **tab_widget["args"])
                tab.attach(widget, 0, i, 1, 1)

            tabs.append_page(tab, tab_label)

        self.attach(tabs, 0, 0, 1, 1)
        self.show_all()


class Settings(object):

    ''' Get settings values using gsettings '''

    _settings = None

    def __new__(cls, *p, **k):
        ''' Implementation of the borg pattern
        This way we make sure that all instances share the same state
        and that the schema is read from file only once.
        '''
        if "_the_instance" not in cls.__dict__:
            cls._the_instance = object.__new__(cls)
        return cls._the_instance

    def set_settings(self, schema_name):
        ''' Get settings values from corresponding schema file '''

        # Try to get schema from local installation directory
        schemas_dir = "%s/schemas" % EXTENSION_DIR
        if os.path.isfile("%s/gschemas.compiled" % schemas_dir):
            schema_source = Gio.SettingsSchemaSource.new_from_directory(
                schemas_dir, Gio.SettingsSchemaSource.get_default(), False)
            schema = schema_source.lookup(schema_name, False)
            self._settings = Gio.Settings.new_full(schema, None, None)
        # Schema is installed system-wide
        else:
            self._settings = Gio.Settings.new(schema_name)

    def get_settings(self):
        return self._settings


class Widgets():

    ''' Build widgets associated with gsettings values '''

    def info_label(self, label, bold=False, italic=True):
        ''' Styled label widget widget '''
        box = BaseGrid()

        label_str = cgi.escape(label)

        if bold:
            label_str = "<b>%s</b>" % label_str

        if italic:
            label_str = "<i>%s</i>" % label_str

        label_element = Gtk.Label(label_str)
        label_element.set_use_markup(True)
        label_element.set_property("hexpand", True)
        label_element.set_property("halign", Gtk.Align.START)
        box.attach(label_element, 0, 0, 1, 1)
        return box

    def switch(self, key, label, tooltip=""):
        ''' Switch widget '''
        box = BaseGrid(tooltip)
        label = Gtk.Label(label)
        label.set_property("hexpand", True)
        label.set_property("halign", Gtk.Align.START)
        widget = Gtk.Switch()
        widget.set_property("halign", Gtk.Align.END)
        widget.set_active(Settings().get_settings().get_boolean(key))
        widget.connect("notify::active", self._switch_change, key)
        box.attach(label, 0, 0, 1, 1)
        box.attach(widget, 1, 0, 1, 1)
        return box

    def _switch_change(self, widget, notice, key):
        Settings().get_settings().set_boolean(key, widget.get_active())

    def entry_path(self, key, label, select_dir, tooltip):
        return FileChooser(key, label, select_dir, tooltip)

    def entry(self, key, label, tooltip=""):
        ''' Entry text widget '''
        box = BaseGrid(tooltip)
        label = Gtk.Label(label)
        label.set_property("hexpand", False)
        label.set_property("halign", Gtk.Align.START)
        widget = Gtk.Entry()
        widget.set_property("hexpand", True)
        widget.set_text(Settings().get_settings().get_string(key))
        widget.connect("changed", self._entry_change, key)
        box.attach(label, 0, 0, 1, 1)
        box.attach(widget, 1, 0, 1, 1)
        return box

    def _entry_change(self, widget, key):
        Settings().get_settings().set_string(key, widget.get_text())

    def combo(self, key, label, values, tooltip=""):
        ''' Combo box widget '''
        box = BaseGrid(tooltip)
        label = Gtk.Label(label)
        label.set_property("hexpand", True)
        label.set_property("halign", Gtk.Align.START)
        widget = Gtk.ComboBoxText()
        widget.set_property("halign", Gtk.Align.END)

        for command, name in sorted(values.items()):
            widget.append(command, name)

        widget.set_active_id(Settings().get_settings().get_string(key))
        widget.connect("changed", self._combo_change, key)
        box.attach(label, 0, 0, 1, 1)
        box.attach(widget, 1, 0, 1, 1)
        return box

    def _combo_change(self, widget, key):
        Settings().get_settings().set_string(key, widget.get_active_id())

    def slider(self, key, label, min, max, step, tooltip=""):
        ''' Slider widget '''
        box = BaseGrid(tooltip)
        label = Gtk.Label(label)
        label.set_property("hexpand", False)
        label.set_property("halign", Gtk.Align.START)
        widget = Gtk.HScale.new_with_range(min, max, step)
        widget.set_value(Settings().get_settings().get_int(key))
        widget.connect("value_changed", self._slider_change, key)
        widget.set_size_request(200, -1)
        widget.set_property("hexpand", True)
        widget.set_property("halign", Gtk.Align.END)
        box.attach(label, 0, 0, 1, 1)
        box.attach(widget, 1, 0, 1, 1)
        return box

    def _slider_change(self, widget, key):
        Settings().get_settings().set_int(key, widget.get_value())

    def spin(self, key, label, min, max, step, units, tooltip=""):
        ''' Spin widget '''
        if units:
            label += " (%s)" % units

        box = BaseGrid(tooltip)
        label = Gtk.Label(label)
        label.set_property("hexpand", True)
        label.set_property("halign", Gtk.Align.START)
        widget = Gtk.SpinButton.new_with_range(min, max, step)
        widget.set_value(Settings().get_settings().get_int(key))
        widget.connect("value-changed", self._spin_change, key)
        widget.set_editable(True)
        widget.set_property("halign", Gtk.Align.END)
        box.attach(label, 0, 0, 1, 1)
        box.attach(widget, 1, 0, 1, 1)
        return box

    def _spin_change(self, widget, key):
        Settings().get_settings().set_int(key, widget.get_value())

    def keybindings_tree(self, keybindings):
        ''' Keybinding tree widget '''
        return KeybindingsTreeViewWidget(keybindings)

    def translators_prefs_widget(self, key):
        ''' Translators prefs widget '''
        return TranslatorProvidersWidget(key)

    def textview(self, key, label, height=200, tooltip=""):
        ''' Textview widget '''
        box = BaseGrid(tooltip)
        box.set_orientation(Gtk.Orientation.VERTICAL)
        label = Gtk.Label.new(label)
        label.set_property("hexpand", True)
        label.set_property("halign", Gtk.Align.CENTER)

        scrolledwindow = Gtk.ScrolledWindow(hadjustment=None, vadjustment=None)
        scrolledwindow.set_size_request(width=-1, height=height)
        scrolledwindow.set_policy(hscrollbar_policy=Gtk.PolicyType.AUTOMATIC,
                                  vscrollbar_policy=Gtk.PolicyType.AUTOMATIC)
        scrolledwindow.set_shadow_type(type=Gtk.ShadowType.ETCHED_IN)
        widget = Gtk.TextView()
        widget.set_editable(True)
        widget.set_border_width(3)
        widget.set_wrap_mode(wrap_mode=Gtk.WrapMode.NONE)
        text_buffer = widget.get_buffer()
        text_buffer.set_text(Settings().get_settings().get_string(key))
        text_buffer.connect("changed", self._textview_change, key, text_buffer)

        box.attach(label, 0, 0, 1, 1)
        box.attach(scrolledwindow, 0, 1, 1, 1)
        scrolledwindow.add(widget)
        return box

    def _textview_change(self, widget, key, text_buffer):
        start_iter = text_buffer.get_start_iter()
        end_iter = text_buffer.get_end_iter()
        text = text_buffer.get_text(start_iter, end_iter, True)

        Settings().get_settings().set_string(key, text)


class FileChooser(BaseGrid):

    ''' FileChooser tree widget '''

    def __init__(self, key, label, select_dir=False, tooltip=""):
        BaseGrid.__init__(self, tooltip)

        self._select_dir = select_dir
        self._key = key

        self.label = Gtk.Label.new(label)
        self.entry = Gtk.Entry()
        self.entry.set_property("hexpand", True)
        self.button = Gtk.Button("")
        self.button.set_image(Gtk.Image().new_from_stock(Gtk.STOCK_OPEN, Gtk.IconSize.BUTTON))
        self.button.get_property("image").show()

        self.attach(self.label, 0, 1, 1, 1)
        self.attach(self.entry, 1, 1, 1, 1)
        self.attach(self.button, 2, 1, 1, 1)

        self.entry.set_text(Settings().get_settings().get_string(self._key))

        self.button.connect("clicked", self.on_button_pressed)
        self.handler = self.entry.connect("changed", self.on_entry_changed)
        self._value_changed_timer = None

    def on_button_pressed(self, widget):
        if self._select_dir:
            mode = Gtk.FileChooserAction.SELECT_FOLDER
            string = _("Select a directory to use")
        else:
            mode = Gtk.FileChooserAction.OPEN
            string = _("Select a file")
        dialog = Gtk.FileChooserDialog(parent=app.window,
                                       title=string,
                                       action=mode,
                                       # TO TRANSLATORS: Could be left blank.
                                       buttons=(_("_Cancel"), Gtk.ResponseType.CANCEL,
                                                # TO TRANSLATORS: Could be left blank.
                                                _("_Open"), Gtk.ResponseType.OK))
        if self._select_dir:
            filt = Gtk.FileFilter()
            filt.set_name(_("Directories"))
            filt.add_custom(Gtk.FileFilterFlags.FILENAME, self.filter_func, None)
            dialog.add_filter(filt)

        dialog.set_filename(Settings().get_settings().get_string(self._key))
        response = dialog.run()

        if response == Gtk.ResponseType.OK:
            filename = dialog.get_filename()
            self.entry.set_text(filename)
            Settings().get_settings().set_string(self._key, filename)

        dialog.destroy()

    def filter_func(chooser, info, data):
        return os.path.isdir(info.filename)

    def on_entry_changed(self, widget):
        if self._value_changed_timer:
            GObject.source_remove(self._value_changed_timer)
        self._value_changed_timer = GObject.timeout_add(300, self.update_from_entry)

    def update_from_entry(self):
        Settings().get_settings().set_string(self._key, self.entry.get_text())
        self._value_changed_timer = None
        return False


class KeybindingsTreeViewWidget(BaseGrid):

    ''' KeybindingsTreeViewWidget tree widget '''

    def __init__(self, keybindings):
        BaseGrid.__init__(self)
        self.set_orientation(Gtk.Orientation.VERTICAL)
        self._keybindings = keybindings

        scrolled_window = Gtk.ScrolledWindow()
        scrolled_window.set_size_request(-1, 150)
        scrolled_window.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)

        self._columns = type("", (), {
            "NAME": 0,
            "ACCEL_NAME": 1,
            "MODS": 2,
            "KEY": 3,
        })

        self._store = Gtk.ListStore(str, str, int, int)
        self._tree_view = Gtk.TreeView()
        self._tree_view.set_property("model", self._store)
        self._tree_view.set_property("hexpand", True)
        self._tree_view.set_property("vexpand", True)
        self._tree_view.set_enable_tree_lines(True)
        self._tree_view.get_selection().set_mode(Gtk.SelectionMode.SINGLE)

        action_renderer = Gtk.CellRendererText()
        action_column = Gtk.TreeViewColumn()
        action_column.set_property("title", "Action")
        action_column.set_property("expand", True)
        action_column.pack_start(action_renderer, True)
        action_column.add_attribute(action_renderer, "text", 1)
        self._tree_view.append_column(action_column)

        keybinding_renderer = Gtk.CellRendererAccel()
        keybinding_renderer.set_property("editable", True)
        keybinding_renderer.set_property("accel-mode", Gtk.CellRendererAccelMode.GTK)
        keybinding_renderer.connect("accel-edited", self.on_shortcut_key_cell_edited)

        keybinding_column = Gtk.TreeViewColumn()
        keybinding_column.set_property("title", "Modify")
        keybinding_column.pack_end(keybinding_renderer, False)
        keybinding_column.add_attribute(keybinding_renderer, "accel-mods", self._columns.MODS)
        keybinding_column.add_attribute(keybinding_renderer, "accel-key", self._columns.KEY)
        self._tree_view.append_column(keybinding_column)

        scrolled_window.add(self._tree_view)
        self.attach(scrolled_window, 1, 1, 1, 1)

        self._refresh()

    def on_shortcut_key_cell_edited(self, accel, path, key, mod, hardware_keycode):
        accel_key = Gtk.accelerator_name(key, mod)
        name = self._store[path][self._columns.NAME]
        self._store[path][3] = key
        self._store[path][2] = mod
        Settings().get_settings().set_strv(name, [accel_key])

    def _refresh(self):
        self._store.clear()

        for settings_key in sorted(self._keybindings):
            [key, mods] = Gtk.accelerator_parse(
                Settings().get_settings().get_strv(settings_key)[self._columns.NAME]
            )

            iter = self._store.append()
            self._store.set(iter, [
                self._columns.NAME,
                self._columns.ACCEL_NAME,
                self._columns.MODS,
                self._columns.KEY
            ], [
                settings_key,
                self._keybindings[settings_key],
                mods,
                key
            ])


class TranslatorProvidersWidget(BaseGrid):

    ''' TranslatorProvidersWidget tree widget '''

    def __init__(self, key):
        BaseGrid.__init__(self)
        self.set_orientation(Gtk.Orientation.VERTICAL)
        self.set_row_spacing(10)
        self._pref_key = key
        self._prefs = json.loads(Settings().get_settings().get_string(key))

        names = list(sorted(self._prefs.keys()))

        # translators
        self._translators_combo = self._get_combo(names)
        self._translators_combo.set_active_id(
            Settings().get_settings().get_string("pref-default-translator"))
        self._translators_combo.connect("changed", self._on_translators_combo_changed)
        self.attach(self._translators_combo, 0, 0, 2, 1)

        # default source
        self._source_languages_combo = self._get_combo([])
        label = Gtk.Label()
        label.set_property("label", _("Default source language:"))
        label.set_property("hexpand", True)
        label.set_property("halign", Gtk.Align.START)
        self.attach(label, 0, 1, 1, 1)

        # default target
        self._target_languages_combo = self._get_combo([])
        label = Gtk.Label()
        label.set_property("label", _("Default target language:"))
        label.set_property("hexpand", True)
        label.set_property("halign", Gtk.Align.START)
        self.attach(label, 0, 2, 1, 1)

        # remember last lang
        label = Gtk.Label()
        label.set_property("label", _("Remember the last used languages:"))
        label.set_property("hexpand", True)
        label.set_property("halign", Gtk.Align.START)
        self.attach(label, 0, 3, 1, 1)
        self._last_used = Gtk.Switch()
        self._last_used.set_property("active", False)
        self._last_used.connect("notify::active", self._notify_active)
        self.attach(self._last_used, 1, 3, 1, 1)

        self._show_settings(Settings().get_settings().get_string("pref-default-translator"))

    def _get_combo(self, items):
        combo_box = Gtk.ComboBoxText()

        for i in range(0, len(items)):
            combo_box.insert(-1, items[i], items[i])

        return combo_box

    def _load_default_source(self, languages, active_id):
        self._source_languages_combo.destroy()

        self._source_languages_combo = Gtk.ComboBoxText()
        self._source_languages_combo.connect("changed", self._on_source_languages_combo_changed)

        self._source_languages_combo.insert(-1, "auto", languages["auto"])

        for key in sorted(languages, key=languages.get):
            if key is not "auto":
                self._source_languages_combo.insert(-1, key, languages[key])

        if active_id == -1:
            active_id = list(languages)[0]

        self._source_languages_combo.set_active_id(active_id)

        source_wrap_width = int(round(len(languages) / 17))

        if source_wrap_width > 1:
            self._source_languages_combo.set_wrap_width(source_wrap_width)

        self._source_languages_combo.show()

        self.attach(self._source_languages_combo, 1, 1, 1, 1)

    def _load_default_target(self, languages, active_id):
        self._target_languages_combo.destroy()

        self._target_languages_combo = Gtk.ComboBoxText()
        self._target_languages_combo.connect("changed", self._on_target_languages_combo_changed)

        for key in sorted(languages, key=languages.get):
            self._target_languages_combo.insert(-1, key, languages[key])

        if active_id == -1:
            active_id = languages[0]

        self._target_languages_combo.set_active_id(active_id)

        target_wrap_width = int(round(len(languages) / 17))

        if target_wrap_width > 1:
            self._target_languages_combo.set_wrap_width(target_wrap_width)

        self._target_languages_combo.show()

        self.attach(self._target_languages_combo, 1, 2, 1, 1)

    def _show_settings(self, name):
        translator = self._prefs[name]

        source_langs = LANGUAGES_LIST
        self._load_default_source(source_langs, translator["default_source"])

        target_langs = self.get_pairs(translator["default_source"])
        self._load_default_target(target_langs, translator["default_target"])

        self._last_used.set_active(translator["remember_last_lang"])

    def _on_translators_combo_changed(self, combo):
        name = combo.get_active_id()
        self._show_settings(name)

    def _notify_active(self, s, widget):
        active = s.get_active()
        name = self._translators_combo.get_active_id()
        translator = self._prefs[name]
        translator["remember_last_lang"] = active

        self.save_settings()

    def _on_source_languages_combo_changed(self, combo):
        name = self._translators_combo.get_active_id()
        translator = self._prefs[name]
        lang_code = combo.get_active_id()

        if translator is None or translator["default_source"] == lang_code:
            return

        translator["default_source"] = lang_code
        languages = self.get_pairs(lang_code)
        active_id = -1

        if languages[translator["default_target"]] != "undefined":
            active_id = translator["default_target"]

        self._load_default_target(languages, active_id)

        self.save_settings()

    def _on_target_languages_combo_changed(self, combo):
        name = self._translators_combo.get_active_id()
        translator = self._prefs[name]
        lang_code = combo.get_active_id()

        if translator is None or translator["default_target"] == lang_code:
            return

        translator["default_target"] = lang_code

        self.save_settings()

    def save_settings(self):
        prefs = json.dumps(self._prefs)
        Settings().get_settings().set_string(self._pref_key, prefs)

    def get_pairs(self, language):
        temp = {}

        for key in LANGUAGES_LIST:
            if key == "auto":
                continue

            temp[key] = LANGUAGES_LIST[key]

        return temp


class ExtensionPrefsWindow(Gtk.ApplicationWindow):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class ExtensionPrefsApplication(Gtk.Application):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, application_id=SCHEMA_NAME,
                         flags=Gio.ApplicationFlags.FLAGS_NONE,
                         **kwargs)
        self.application = Gtk.Application()

        self.application.connect("activate", self.do_activate)
        self.application.connect("startup", self.do_startup)

    def do_activate(self):
        self.window.present()

    def do_startup(self):
        Gtk.Application.do_startup(self)
        self._buildUI()

    def _buildUI(self):
        self.window = ExtensionPrefsWindow(
            application=self, title=_("Multi Translator Preferences"))
        self.window.set_position(Gtk.WindowPosition.CENTER)
        self.window.set_size_request(width=-1, height=300)
        self.window.set_icon_from_file(os.path.join(EXTENSION_DIR, "icon.png"))
        self.window.connect("destroy", self.on_quit)

        self.settings_box = SettingsBox()

        # Buttons box
        box_buttons = BaseGrid()
        btn_close = Gtk.Button(stock=Gtk.STOCK_CLOSE)
        btn_close.connect("clicked", self.on_quit)
        box_buttons.attach(btn_close, 5, 1, 1, 1)

        # Not much use for this. Leave it just in case.
        # img_restart_cinn = Gtk.Image()
        # img_restart_cinn.set_from_stock(Gtk.STOCK_REFRESH, 3)
        # btn_restart_cinn = Gtk.Button()
        # btn_restart_cinn.set_property("image", img_restart_cinn)
        # btn_restart_cinn.set_tooltip_text(_("Restart Cinnamon."))
        # btn_restart_cinn.connect("clicked", self._restart_shell)
        # box_buttons.pack_start(btn_restart_cinn, False, False, 0)
        # box_buttons.attach(btn_restart_cinn, 0, 1, 1, 1)

        img_reset_default = Gtk.Image()
        img_reset_default.set_from_stock(Gtk.STOCK_CLEAR, 1)
        btn_reset_default = Gtk.Button()
        btn_reset_default.set_property("image", img_reset_default)
        btn_reset_default.set_tooltip_text(_("Reset settings to defaults"))
        btn_reset_default.connect("clicked", self._restore_default_values)
        box_buttons.attach(btn_reset_default, 0, 1, 1, 1)

        img_import = Gtk.Image()
        img_import.set_from_stock(Gtk.STOCK_GO_UP, 1)
        btn_import = Gtk.Button()
        btn_import.set_property("image", img_import)
        btn_import.set_tooltip_text(_("Import settings from a file"))
        btn_import.connect("clicked", self._import_export_settings, False)
        box_buttons.attach(btn_import, 1, 1, 1, 1)

        img_export = Gtk.Image()
        img_export.set_from_stock(Gtk.STOCK_GO_DOWN, 1)
        btn_export = Gtk.Button()
        btn_export.set_property("image", img_export)
        btn_export.set_tooltip_text(_("Export settings to a file"))
        btn_export.connect("clicked", self._import_export_settings, True)
        box_buttons.attach(btn_export, 2, 1, 1, 1)

        dummy_grid = BaseGrid()
        dummy_grid.set_property("hexpand", True)
        box_buttons.attach(dummy_grid, 3, 1, 1, 1)

        self.settings_box.attach(box_buttons, 0, 1, 1, 1)

        self.window.add(self.settings_box)
        self.window.show_all()

    # Not used for now
    def _restore_default_values(self, widget):
        dialog = Gtk.MessageDialog(transient_for=self.window,
                                   modal=False,
                                   message_type=Gtk.MessageType.WARNING,
                                   buttons=Gtk.ButtonsType.YES_NO)

        dialog.set_title("Warning: Trying to reset all Multi Translator settings!!!")

        esc = cgi.escape(_("Reset all Multi Translator settings to default?"))
        dialog.set_markup(esc)
        dialog.show_all()
        response = dialog.run()
        dialog.destroy()

        if response == Gtk.ResponseType.YES:
            os.system("gsettings reset-recursively %s &" % SCHEMA_NAME)
            self.on_quit(self)

    def _import_export_settings(self, widget, export):
        if export:
            mode = Gtk.FileChooserAction.SAVE
            string = _("Select or enter file to export to")
            # TO TRANSLATORS: Could be left blank.
            btns = (_("_Cancel"), Gtk.ResponseType.CANCEL,
                    _("_Save"), Gtk.ResponseType.ACCEPT)
        else:
            mode = Gtk.FileChooserAction.OPEN
            string = _("Select a file to import")
            # TO TRANSLATORS: Could be left blank.
            btns = (_("_Cancel"), Gtk.ResponseType.CANCEL,
                    # TO TRANSLATORS: Could be left blank.
                    _("_Open"), Gtk.ResponseType.OK)

        dialog = Gtk.FileChooserDialog(parent=app.window,
                                       title=string,
                                       action=mode,
                                       buttons=btns)

        if export:
            dialog.set_do_overwrite_confirmation(True)

        filter_text = Gtk.FileFilter()
        filter_text.add_pattern("*.dconf")
        filter_text.set_name(_("DCONF files"))
        dialog.add_filter(filter_text)

        response = dialog.run()

        if export and response == Gtk.ResponseType.ACCEPT:
            filename = dialog.get_filename()

            if ".dconf" not in filename:
                filename = filename + ".dconf"

            os.system("dconf dump %s > %s &" % (SCHEMA_PATH, filename))

        if export is False and response == Gtk.ResponseType.OK:
            filename = dialog.get_filename()
            os.system("dconf load %s < %s" % (SCHEMA_PATH, filename))
            self.on_quit(self)

        dialog.destroy()

    def _restart_shell(self, widget):
        os.system("nohup cinnamon --replace >/dev/null 2>&1&")

    def on_quit(self, action):
        self.quit()


def ui_thread_do(callback, *args):
    GLib.idle_add(callback, *args, priority=GLib.PRIORITY_DEFAULT)


def ui_error_message(msg, detail=None):
    dialog = Gtk.MessageDialog(transient_for=None,
                               modal=True,
                               message_type=Gtk.MessageType.ERROR,
                               buttons=Gtk.ButtonsType.OK)

    try:
        esc = cgi.escape(msg)
    except:
        esc = msg

    dialog.set_markup(esc)
    dialog.show_all()
    response = dialog.run()
    dialog.destroy()


def install_schema():
    file = os.path.join(EXTENSION_DIR, "schemas", SCHEMA_NAME + ".gschema.xml")
    if os.path.exists(file):
        # TO TRANSLATORS: Could be left blank.
        sentence = _("Please enter your password to install the required settings schema for %s") % (
            EXTENSION_UUID)

        if os.path.exists("/usr/bin/gksu") and os.path.exists("/usr/share/cinnamon/cinnamon-settings/bin/installSchema.py"):
            launcher = "gksu  --message \"<b>%s</b>\"" % sentence
            tool = "/usr/share/cinnamon/cinnamon-settings/bin/installSchema.py %s" % file
            command = "%s %s" % (launcher, tool)
            os.system(command)
        else:
            ui_error_message(
                # TO TRANSLATORS: Could be left blank.
                msg=_("Could not install the settings schema for %s.  You will have to perform this step yourself.") % (EXTENSION_UUID))


if __name__ == "__main__":
    try:
        arg = sys.argv[1]
    except:
        arg = None

    # I don't think that this is needed.
    # Leaving it because it just don't hurt.
    if arg == "install-schema":
        install_schema()
    else:
        # Initialize and load gsettings values
        Settings().set_settings(SCHEMA_NAME)

        app = ExtensionPrefsApplication()
        app.run()
