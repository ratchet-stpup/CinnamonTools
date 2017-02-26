const Util = imports.misc.util;
const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const Gettext = imports.gettext;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Cinnamon = imports.gi.Cinnamon;

const TIMEOUT_IDS = {};

const TRIGGERS = {
    translate: true
};

const CONNECTION_IDS = {
    enable_shortcuts: 0
};

const State = {
    OPENED: 0,
    CLOSED: 1,
    OPENING: 2,
    CLOSING: 3,
    FADED_OUT: 4
};

var $;
var metadata;
var main_extension_dir;
var settings;

function _(aStr) {
    let customTrans = Gettext.dgettext(metadata.uuid, aStr);

    if (customTrans != aStr)
        return customTrans;

    return Gettext.gettext(aStr);
}

function TranslatorExtension() {
    this._init();
}

TranslatorExtension.prototype = {
    _init: function() {
        try {
            this._dialog = new $.TranslatorDialog(this);
            this._dialog.dialog_layout.connect("key-press-event", Lang.bind(this,
                this._on_key_press_event
            ));
            this._translators_manager = new $.TranslatorsManager(
                this
            );

            this.oldTheme = "";

            this._dialog.source.max_length =
                this._translators_manager.current.limit;
            this._dialog.source.connect("activate", Lang.bind(this, this._translate));

            this._languages_stats = new $.LanguagesStats();
            this._add_topbar_buttons();
            this._add_dialog_menu_buttons();
            this._init_languages_chooser();
            this._set_current_languages();

            this._init_most_used();
            settings.connect(
                "changed::pref_show_most_used",
                Lang.bind(this, this._init_most_used)
            );

            settings.connect(
                "changed::pref_dialog_theme",
                Lang.bind(this, Lang.bind(this, function() {
                    this._loadTheme(true);
                }))
            );

            this._loadTheme();

            this.historyFile = null;
            this._translation_history = null;
            this.ensureHistoryFileExists();
        } catch (aErr) {
            global.logError(aErr);
        }
    },

    _init_most_used: function() {
        if (!settings.getValue("pref_show_most_used"))
            return;

        this._languages_stats.connect(
            "stats-changed",
            Lang.bind(this, this._show_most_used)
        );
        this._dialog.most_used.sources.connect(
            "clicked",
            Lang.bind(this, function(object, data) {
                this._dialog.most_used.sources.select(data.lang_code);
                this._set_current_source(data.lang_code);
                this._current_langs_changed();
            })
        );
        this._dialog.most_used.targets.connect(
            "clicked",
            Lang.bind(this, function(object, data) {
                this._dialog.most_used.targets.select(data.lang_code);
                this._set_current_target(data.lang_code);
                this._current_langs_changed();
            })
        );
    },

    _show_most_used: function() {
        if (!settings.getValue("pref_show_most_used"))
            return;

        let most_used_sources = this._languages_stats.get_n_most_used(
            this._translators_manager.current.name,
            $.STATS_TYPE_SOURCE,
            5
        );
        this._dialog.most_used.sources.set_languages(most_used_sources);

        let most_used_targets = this._languages_stats.get_n_most_used(
            this._translators_manager.current.name,
            $.STATS_TYPE_TARGET,
            5
        );
        this._dialog.most_used.targets.set_languages(most_used_targets);

        this._most_used_bar_select_current();
    },

    _most_used_bar_select_current: function() {
        if (!settings.getValue("pref_show_most_used"))
            return;

        this._dialog.most_used.sources.select(this._current_source_lang);
        this._dialog.most_used.targets.select(this._current_target_lang);
    },

    _init_languages_chooser: function() {
        this._source_language_chooser = new $.LanguageChooser(
            _("Choose source language") + ":"
        );
        this._source_language_chooser.connect("language-chose", Lang.bind(this,
            this._on_source_language_chose
        ));

        this._target_language_chooser = new $.LanguageChooser(
            _("Choose target language") + ":"
        );
        this._target_language_chooser.connect("language-chose", Lang.bind(this,
            this._on_target_language_chose
        ));
    },

    /**
     * Since the removal of certain features from the original extension,
     * this function is not used.
     * Keep it just in case it's usefull in the future.
     */
    _remove_timeouts: function(timeout_key) {
        if (!$.is_blank(timeout_key)) {
            if (TIMEOUT_IDS[timeout_key] > 0) {
                Mainloop.source_remove(TIMEOUT_IDS[timeout_key]);
            }
        } else {
            for (let key in TIMEOUT_IDS) {
                if (TIMEOUT_IDS[key] > 0) {
                    Mainloop.source_remove(TIMEOUT_IDS[key]);
                }
            }
        }
    },

    _on_key_press_event: function(object, event) {
        let state = event.get_state();
        let symbol = event.get_key_symbol();
        let code = event.get_key_code();

        let cyrillic_control = 8196;
        // Not used, but keep it anyways.
        // let cyrillic_shift = 8192;

        if (symbol == Clutter.Escape) {
            this.close();
        } else if (
            (
                state == Clutter.ModifierType.SHIFT_MASK + Clutter.ModifierType.CONTROL_MASK ||
                state == Clutter.ModifierType.SHIFT_MASK + cyrillic_control
            ) &&
            code == 54
        ) { // ctrl+shift+c - copy translated text to clipboard
            let text = this._dialog.target.text;

            if ($.is_blank(text)) {
                this._dialog.statusbar.add_message(
                    _("There is nothing to copy."),
                    1500,
                    $.STATUS_BAR_MESSAGE_TYPES.error,
                    false
                );
            } else {
                let clipboard = St.Clipboard.get_default();
                clipboard.set_text(text);
                this._dialog.statusbar.add_message(
                    _("Translated text copied to clipboard."),
                    1500,
                    $.STATUS_BAR_MESSAGE_TYPES.info,
                    false
                );
            }
        } else if (
            (state == Clutter.ModifierType.CONTROL_MASK || state == cyrillic_control) &&
            code == 39
        ) { // ctr+s - swap languages
            this._swap_languages();
        } else if (
            (state == Clutter.ModifierType.CONTROL_MASK || state == cyrillic_control) &&
            code == 40
        ) { // ctrl+d - reset languages to default
            this._reset_languages();
        } else if (symbol == Clutter.KEY_Super_L || symbol == Clutter.KEY_Super_R) { // Super - close
            this.close();
        } else {
            // let t = {
            //     state: state,
            //     symbol: symbol,
            //     code: code
            // };
            // log(JSON.stringify(t, null, '\t'));
        }
    },

    _set_current_translator: function(name) {
        this._translators_button.label = "<u>%s</u>".format(name);

        this._translators_manager.current = name;
        this._dialog.source.max_length =
            this._translators_manager.current.limit;
        this._set_current_languages();
        this._show_most_used();

        this._dialog.source.grab_key_focus();
    },

    _set_current_source: function(lang_code) {
        this._current_source_lang = lang_code;
        this._translators_manager.current.prefs.last_source = lang_code;
    },

    _set_current_target: function(lang_code) {
        this._current_target_lang = lang_code;
        this._translators_manager.current.prefs.last_target = lang_code;
    },

    _set_current_languages: function() {
        let current_translator = this._translators_manager.current;
        let current_source = current_translator.prefs.default_source;
        let current_target = current_translator.prefs.default_target;

        if (current_translator.prefs.remember_last_lang) {
            current_source =
                current_translator.prefs.last_source !== false ? current_translator.prefs.last_source : current_translator.prefs.default_source;
            current_target =
                current_translator.prefs.last_target ? current_translator.prefs.last_target : current_translator.prefs.default_target;
        }

        this._set_current_source(current_source);
        this._set_current_target(current_target);
        this._current_langs_changed();
    },

    _swap_languages: function() {
        let source = this._current_source_lang;
        let target = this._current_target_lang;
        this._set_current_source(target);
        this._set_current_target(source);
        this._current_langs_changed();
        this._most_used_bar_select_current();
        this._translate();
    },

    _reset_languages: function() {
        let current = this._translators_manager.current;
        this._set_current_source(current.prefs.default_source);
        this._set_current_target(current.prefs.default_target);
        this._current_langs_changed();
        this._most_used_bar_select_current();
    },

    _update_stats: function() {
        let source_data = {
            code: this._current_source_lang,
            name: this._translators_manager.current.get_language_name(
                this._current_source_lang
            )
        };
        this._languages_stats.increment(
            this._translators_manager.current.name,
            $.STATS_TYPE_SOURCE,
            source_data
        );
        let target_data = {
            code: this._current_target_lang,
            name: this._translators_manager.current.get_language_name(
                this._current_target_lang
            )
        };
        this._languages_stats.increment(
            this._translators_manager.current.name,
            $.STATS_TYPE_TARGET,
            target_data
        );
    },

    _show_help: function() {
        let help_dialog = new $.HelpDialog();
        help_dialog.open();
    },

    _openTranslationHistory: function() {
        try {
            this.close();
            Util.spawn_async([
                /*"python3",*/
                main_extension_dir + "/extensionHelper.py",
                "history",
                settings.getValue("pref_history_initial_window_width") + "," +
                settings.getValue("pref_history_initial_window_height") + "," +
                settings.getValue("pref_history_width_to_trigger_word_wrap")
            ], null);
        } catch (aErr) {
            global.logError(aErr);
        }
    },

    _on_source_language_chose: function(object, language) {
        this._most_used_bar_select_current();
        this._set_current_source(language.code);
        this._current_langs_changed();
        this._source_language_chooser.close();
        this._translate();
    },

    _on_target_language_chose: function(object, language) {
        this._most_used_bar_select_current();
        this._set_current_target(language.code);
        this._current_langs_changed();
        this._target_language_chooser.close();
        this._translate();
    },

    _current_langs_changed: function() {
        this._source_lang_button.label =
            "%s <u>%s</u>".format(
                // TO TRANSLATORS: Full sentence:
                // "»From« source language to target language with service provider."
                _("From"),
                this._translators_manager.current.get_language_name(
                    this._current_source_lang
                )
            );
        this._target_lang_button.label =
            "%s <u>%s</u>".format(
                // TO TRANSLATORS: Full sentence:
                // "From source language »to« target language with service provider."
                _("to"),
                this._translators_manager.current.get_language_name(
                    this._current_target_lang
                )
            );
    },

    _get_source_lang_button: function() {
        let button_params = {
            button_style_class: "tranlator-top-bar-button-reactive",
            statusbar: this._dialog.statusbar
        };
        let button = new $.ButtonsBarButton(
            false,
            "<u>%s: %s</u>".format(
                _("From"),
                this._translators_manager.current.get_language_name(this._current_source_lang)
            ),
            _("Choose source language"),
            button_params,
            Lang.bind(this, function() {
                this._source_language_chooser.open();
                this._source_language_chooser.set_languages(
                    this._translators_manager.current.get_languages()
                );
                this._source_language_chooser.show_languages(
                    this._current_source_lang
                );
            })
        );

        return button;
    },

    _get_target_lang_button: function() {
        let button_params = {
            button_style_class: "tranlator-top-bar-button-reactive",
            statusbar: this._dialog.statusbar
        };
        let button = new $.ButtonsBarButton(
            false,
            "<u>%s: %s</u>".format(
                _("to"),
                this._translators_manager.current.get_language_name(
                    this._current_target_lang
                )
            ),
            _("Choose target language"),
            button_params,
            Lang.bind(this, function() {
                this._target_language_chooser.open();
                this._target_language_chooser.set_languages(
                    this._translators_manager.current.get_pairs(this._current_source_lang)
                );
                this._target_language_chooser.show_languages(
                    this._current_target_lang
                );
            })
        );

        return button;
    },

    _get_swap_langs_button: function() {
        let button_params = {
            button_style_class: "tranlator-top-bar-button-reactive",
            statusbar: this._dialog.statusbar
        };
        let button = new $.ButtonsBarButton(
            false,
            " \u21C4 ",
            _("Swap languages"),
            button_params,
            Lang.bind(this, this._swap_languages)
        );

        return button;
    },

    _get_translators_button: function() {
        let button;

        if (this._translators_manager.num_translators < 2) {
            button = new $.ButtonsBarLabel(
                this._translators_manager.current.name,
                "tranlator-top-bar-button"
            );
        } else {
            let button_params = {
                button_style_class: "tranlator-top-bar-button-reactive",
                statusbar: this._dialog.statusbar
            };
            button = new $.ButtonsBarButton(
                false,
                "<u>%s</u>".format(this._translators_manager.current.name),
                _("Choose translation provider"),
                button_params,
                Lang.bind(this, function() {
                    let translators_popup = new $.TranslatorsPopup(
                        button,
                        this._dialog
                    );
                    let names = this._translators_manager.translators_names;

                    for (let i = 0; i < names.length; i++) {
                        let name = names[i];
                        if (name === this._translators_manager.current.name) {
                            continue;
                        }

                        translators_popup.add_item(name,
                            Lang.bind(this, function() {
                                this._set_current_translator(name);
                            })
                        );
                    }

                    translators_popup.open();
                })
            );
        }

        return button;
    },

    _get_translate_button: function() {
        let button_params = {
            button_style_class: "tranlator-top-bar-go-button",
            statusbar: this._dialog.statusbar
        };
        let button = new $.ButtonsBarButton(
            false,
            _("Go!"),
            _("Translate text (<Ctrl> + <Enter>)"),
            button_params,
            Lang.bind(this, this._translate)
        );

        return button;
    },

    _get_menu_button: function() {
        let button_params = {
            button_style_class: "translator-dialog-menu-button",
            statusbar: this._dialog.statusbar
        };

        let button = new $.ButtonsBarButton(
            $.ICONS.hamburger,
            "",
            _("Main menu"),
            button_params,
            Lang.bind(this, function() {
                let menu_popup = new $.TranslatorsPopup(
                    button,
                    this._dialog
                );
                let items = [
                    [
                        _("Preferences"),
                        Lang.bind(this, function() {
                            this.close();
                            Util.spawn(["cinnamon-settings", "extensions", metadata.uuid]);
                        }),
                        $.ICONS.preferences
                    ],
                    [
                        _("Translation history"),
                        Lang.bind(this, this._openTranslationHistory),
                        $.ICONS.history
                    ]
                ];

                for (let i = 0; i < items.length; i++) {
                    //                  name,        action     , icon
                    menu_popup.add_item(items[i][0], items[i][1], items[i][2]);
                }

                menu_popup.open();
            })
        );

        return button;
    },

    _get_help_button: function() {
        let button_params = {
            button_style_class: "translator-dialog-menu-button",
            statusbar: this._dialog.statusbar
        };

        let button = new $.ButtonsBarButton(
            $.ICONS.help,
            "",
            _("Help"),
            button_params,
            Lang.bind(this, this._show_help));

        return button;
    },

    // _get_prefs_button: function() {
    //     let button_params = {
    //         button_style_class: "translator-dialog-menu-button",
    //         statusbar: this._dialog.statusbar
    //     };
    //     let button = new $.ButtonsBarButton(
    //         $.ICONS.preferences,
    //         "",
    //         _("Preferences"),
    //         button_params,
    //         Lang.bind(this, function() {
    //             this.close();
    //             Util.spawn(["cinnamon-settings", "extensions", metadata.uuid]);
    //         })
    //     );

    //     return button;
    // },

    _get_close_button: function() {
        let button_params = {
            button_style_class: "translator-dialog-menu-button",
            statusbar: this._dialog.statusbar
        };
        let button = new $.ButtonsBarButton(
            $.ICONS.shutdown,
            "",
            _("Quit"),
            button_params,
            Lang.bind(this, function() {
                this.close();
            })
        );

        return button;
    },

    _add_topbar_buttons: function() {
        let translate_label = new $.ButtonsBarLabel(
            " ",
            "tranlator-top-bar-button"
        );
        this._dialog.topbar.add_button(translate_label);

        this._source_lang_button = this._get_source_lang_button();
        this._dialog.topbar.add_button(this._source_lang_button);

        this._swap_languages_button = this._get_swap_langs_button();
        this._dialog.topbar.add_button(this._swap_languages_button);

        this._target_lang_button = this._get_target_lang_button();
        this._dialog.topbar.add_button(this._target_lang_button);

        let by_label = new $.ButtonsBarLabel(
            // TO TRANSLATORS: Full sentence:
            // "From source language to target language »with« service provider."
            " %s ".format(_("with")),
            "tranlator-top-bar-button"
        );
        this._dialog.topbar.add_button(by_label);

        this._translators_button = this._get_translators_button();
        this._dialog.topbar.add_button(this._translators_button);

        translate_label = new $.ButtonsBarLabel(
            " ",
            "tranlator-top-bar-button"
        );
        this._dialog.topbar.add_button(translate_label);

        this._translate_button = this._get_translate_button();
        this._dialog.topbar.add_button(this._translate_button);
    },

    _add_dialog_menu_buttons: function() {
        let menu_button = this._get_menu_button();
        this._dialog.dialog_menu.add_button(menu_button, true);

        let help_button = this._get_help_button();
        this._dialog.dialog_menu.add_button(help_button, true);

        // let prefs_button = this._get_prefs_button();
        // this._dialog.dialog_menu.add_button(prefs_button, true);

        let close_button = this._get_close_button();
        this._dialog.dialog_menu.add_button(close_button, true);
    },

    _translate: function() {
        if ($.is_blank(this._dialog.source.text))
            return;

        this._update_stats();
        this._dialog.target.text = "";
        let message_id = this._dialog.statusbar.add_message(
            _("Translating..."),
            0,
            $.STATUS_BAR_MESSAGE_TYPES.info,
            true
        );

        this._translators_manager.current.translate(
            this._current_source_lang,
            this._current_target_lang,
            this._dialog.source.text,
            Lang.bind(this, function(result) {
                this._dialog.statusbar.remove_message(message_id);

                if (result.error) {
                    this._dialog.statusbar.add_message(
                        result.message,
                        4000,
                        $.STATUS_BAR_MESSAGE_TYPES.error
                    );
                } else {
                    this._dialog.target.markup = "%s".format(result);
                }
            })
        );
    },

    _translate_from_clipboard: function(aTranslateSelection) {
        this.open();

        try {
            let clipboard = St.Clipboard.get_default();
            let selection = this.selection;

            if (aTranslateSelection) {
                TRIGGERS.translate = false;
                this._dialog.source.text = selection;
                this._translate();
            } else {
                clipboard.get_text(Lang.bind(this, function(clipboard, text) {
                    if ($.is_blank(text)) {
                        this._dialog.statusbar.add_message(
                            _("Clipboard is empty."),
                            2000,
                            $.STATUS_BAR_MESSAGE_TYPES.error,
                            false
                        );
                        return;
                    }

                    TRIGGERS.translate = false;
                    this._dialog.source.text = text;
                    this._translate();
                }));
            }
        } catch (aErr) {
            global.logError(aErr);
        }
    },

    _add_keybindings: function() {
        Main.keybindingManager.addHotKey(
            "open_translator_dialog_keybinding",
            settings.getValue("pref_open_translator_dialog_keybinding"),
            Lang.bind(this, function() {
                if (this._dialog.state === State.OPENED || this._dialog.state === State.OPENING)
                    this.close();
                else
                    this.open();
            })
        );

        Main.keybindingManager.addHotKey(
            "translate_from_clipboard_keybinding",
            settings.getValue("pref_translate_from_clipboard_keybinding"),
            Lang.bind(this, function() {
                this._translate_from_clipboard(false);
            })
        );

        Main.keybindingManager.addHotKey(
            "translate_from_selection_keybinding",
            settings.getValue("pref_translate_from_selection_keybinding"),
            Lang.bind(this, function() {
                this._translate_from_clipboard(true);
            })
        );
    },

    _remove_keybindings: function() {
        Main.keybindingManager.removeHotKey(settings.getValue("pref_open_translator_dialog_keybinding"));
        Main.keybindingManager.removeHotKey(settings.getValue("pref_translate_from_clipboard_keybinding"));
        Main.keybindingManager.removeHotKey(settings.getValue("pref_translate_from_selection_keybinding"));
    },

    open: function() {
        try {
            if (settings.getValue("pref_remember_last_translator")) {
                let translator =
                    this._translators_manager.last_used ?
                    this._translators_manager.last_used.name :
                    this._translators_manager.default.name;
                this._set_current_translator(translator);
            } else {
                this._set_current_translator(this._translators_manager.default.name);
            }

            this._dialog.open();
            this._dialog.source.clutter_text.set_selection(
                0,
                this._dialog.source.length
            );
            this._dialog.source.clutter_text.grab_key_focus();
            this._dialog.source.max_length = this._translators_manager.current.limit;
            this._set_current_languages();
            this._show_most_used();
        } catch (aErr) {
            global.logError(aErr);
        }
    },

    close: function() {
        this._dialog.close();
    },

    enable: function() {
        try {
            if (settings.getValue("pref_enable_shortcuts")) {
                this._add_keybindings();
            }

            CONNECTION_IDS.enable_shortcuts =
                settings.connect("changed::pref_enable_shortcuts",
                    Lang.bind(this, function() {
                        let enable = settings.getValue("pref_enable_shortcuts");

                        if (enable)
                            this._add_keybindings();
                        else
                            this._remove_keybindings();
                    })
                );
        } catch (aErr) {
            global.logError(aErr);
        }
    },

    disable: function() {
        this.close();
        this._dialog.destroy();
        this._translators_manager.destroy();
        this._source_language_chooser.destroy();
        this._target_language_chooser.destroy();
        this._remove_keybindings();

        if (CONNECTION_IDS.enable_shortcuts > 0) {
            settings.disconnect(CONNECTION_IDS.enable_shortcuts);
        }
    },

    _loadTheme: function(aFullReload) {
        let newTheme = settings.getValue("pref_dialog_theme");

        // Nothing to do here.
        if (newTheme === this.oldTheme)
            return;

        /**
         * With the following call to Main.loadTheme(), the themes used by this extension are correctly loaded,
         * but absolutely all style sheets from every single freaking xlet currently loaded
         * in the system will be unloaded.
         * Without the call to Main.loadTheme(), the themes used by this extension are not loaded correctly.
         * Gave up and chose to force a Cinnamon restart every time the themes are switched. ¬¬
         */
        // if (aFullReload)
        //     Main.loadTheme();
        /**
         * Giving it a shot to Main.themeManager._changeTheme().
         * It seems that it isn't affecting the style sheets set by other xlets at the moment.
         */
        if (aFullReload)
            Main.themeManager._changeTheme();

        // Saves us from having to do this twice.
        let theme = St.ThemeContext.get_for_stage(global.stage).get_theme();

        try {
            // Unload old theme so we can hotswap it for a new shiny one.
            if (this.oldTheme !== "") {
                theme.unload_stylesheet(this._getCssPath(this.oldTheme));
            }

        } finally {
            // Apply new theme. Old method, no longer requires restart really. ;)
            theme.load_stylesheet(this._getCssPath(newTheme));

            // Remember old theme so we can hotswap it later.
            this.oldTheme = newTheme;

        }
    },

    _getCssPath: function(theme) {
        // Get CSS of new theme, and check it exists, falling back to "default"
        let cssPath = main_extension_dir + "/themes/" + theme + ".css";
        let cssFile = Gio.file_new_for_path(cssPath);

        if (!cssFile.query_exists(null)) {
            cssPath = main_extension_dir + "/themes/default.css";
        }

        return cssPath;
    },

    ensureHistoryFileExists: function() {
        let configPath = [GLib.get_home_dir(), ".cinnamon", "configs", "0dyseus@MultiTranslatorHistory"].join("/");
        let configDir = Gio.file_new_for_path(configPath);

        if (!configDir.query_exists(null))
            configDir.make_directory_with_parents(null);

        this.historyFile = configDir.get_child("translation_history.json");

        let data,
            forceSaving;

        try {
            if (this.historyFile.query_exists(null)) {
                forceSaving = false;
                data = JSON.parse(Cinnamon.get_file_contents_utf8_sync(this.historyFile.get_path()));
            } else {
                forceSaving = true;
                data = {
                    __version__: 1
                };
            }
        } finally {
            try {
                // Implemented __version__ in case that in the future I decide
                // to change again the history mechanism. Not likely (LOL).
                this._translation_history = data;
            } finally {
                if (forceSaving)
                    this.saveHistoryToFile();
            }
        }
    },

    saveHistoryToFile: function() {
        let rawData;

        if (settings.getValue("pref_loggin_save_history_indented"))
            rawData = JSON.stringify(this._translation_history, null, "    ");
        else
            rawData = JSON.stringify(this._translation_history);

        let raw = this.historyFile.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let out_file = Gio.BufferedOutputStream.new_sized(raw, 4096);
        Cinnamon.write_string_to_stream(out_file, rawData);
        out_file.close(null);
    },

    get transHistory() {
        return this._translation_history;
    },

    setTransHistory: function(aSourceText, aTransObj) {
        this._translation_history[aTransObj.tL] = this._translation_history[aTransObj.tL] || {};
        this._translation_history[aTransObj.tL][aSourceText] = aTransObj;
        this.saveHistoryToFile();
    },

    get current_target_lang() {
        return this._current_target_lang;
    },

    get current_source_lang() {
        return this._current_source_lang;
    },

    get selection() {
        let str = "";
        try {
            let process = new $.ShellOutputProcess(["xsel", "-o"]);
            // Remove possible "illegal" characters.
            str = $.escape_html(process.spawn_sync_and_get_output());
            // Replace line breaks and duplicated white spaces with a single space.
            str = (str.replace(/\s+/g, " ")).trim();

            if (this.pref_loggin_enabled)
                global.logError("\nselection()>str:\n" + str);
        } catch (aErr) {
            global.logError(aErr);
        } finally {
            return str;
        }
    }
};

let translator = null;

function init(aExtensionMeta) {
    metadata = aExtensionMeta;
    Gettext.bindtextdomain(metadata.uuid, GLib.get_home_dir() + "/.local/share/locale");
    let extension_dir = metadata.path;
    main_extension_dir = extension_dir;

    try {
        // Use the main_extension_dir directory for imports shared by all
        // supported Cinnamon versions.
        // If I use just extension_dir, I would be forced to put the
        // files to be imported repeatedly inside each version folder. ¬¬
        let regExp = new RegExp("(" + metadata.uuid + ")$", "g");
        if (!regExp.test(main_extension_dir)) {
            let tempFile = Gio.file_new_for_path(main_extension_dir);
            main_extension_dir = tempFile.get_parent().get_path();
        }
    } finally {
        imports.searchPath.push(main_extension_dir);

        $ = imports[metadata.uuid];
    }

    settings = new $.SettingsHandler(metadata.uuid).settings;
}

function enable() {
    translator = new TranslatorExtension();
    translator.enable();
}

function disable() {
    if (translator !== null) {
        translator.disable();
        translator = null;
    }
}
