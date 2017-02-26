const ExtensionUUID = "0dyseus@MultiTranslatorExtension";
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Tweener = imports.ui.tweener;
const Gettext = imports.gettext;

function _(aStr) {
    let customTrans = Gettext.dgettext(ExtensionUUID, aStr);

    if (customTrans != aStr)
        return customTrans;

    return Gettext.gettext(aStr);
}

imports.searchPath.push(imports.ui.extensionSystem.extensionMeta[ExtensionUUID].path);

var $ = imports[ExtensionUUID];

const NAME = "Google.Translate";
const LIMIT = 1400;
const MAX_QUERIES = 3;

const SENTENCES_REGEXP = /\n|([^\r\n.!?]+([.!?]+|\n|$))/gim;

function DictionaryEntry(word, reverse_translations) {
    this._init(word, reverse_translations);
}

DictionaryEntry.prototype = {
    _init: function(word, reverse_translations) {
        this.word = word;
        this.reverse_translations = reverse_translations || [];

        this._grid_layout = new Clutter.GridLayout({
            orientation: Clutter.Orientation.VERTICAL
        });
        this.actor = new St.Widget({
            layout_manager: this._grid_layout
        });

        this.word_label = new St.Label();
        this.word_label.clutter_text.set_markup(
            "<span font-size='small'>   %s        </span>".format(this.word)
        );

        let reverse_markup =
            "<span font-size='small' font-style='italic' " +
            "color='#C4C4C4'>%s</span>".format(
                this.reverse_translations.join(", ")
            );
        this.reverse_translations_label = new St.Label();
        this.reverse_translations_label.clutter_text.set_markup(reverse_markup);

        this._grid_layout.attach(this.word_label, 0, 0, 1, 1);
        this._grid_layout.attach(this.reverse_translations_label, 1, 0, 1, 1);
    },
};

function DictionaryPOS(pos, word) {
    this._init(pos, word);
}

DictionaryPOS.prototype = {
    _init: function(pos, word) {
        this.actor = new St.BoxLayout({
            vertical: true
        });

        let markup =
            "<span font-weight='bold' font-size='medium'>%s</span>".format(word) +
            " - <span font-size='medium' font-style='italic' " +
            "color='#C4C4C4'>%s</span>".format(pos);
        this._pos_label = new St.Label();
        this._pos_label.clutter_text.set_markup(markup);

        this.actor.add(this._pos_label);
    },

    add_entry: function(dictionary_entry) {
        this.actor.add(dictionary_entry.actor, {
            x_fill: false,
            x_expand: false,
            y_fill: false,
            y_expand: false,
            y_align: St.Align.START,
            x_align: St.Align.START
        });
    },
};

function Dictionary(word, dict_data) {
    this._init(word, dict_data);
}

Dictionary.prototype = {

    _init: function(word, dict_data) {
        this._word = word;
        this._data = dict_data;

        this._box = new St.BoxLayout({
            vertical: true
        });
        this._scroll = new St.ScrollView({
            style: "background-color: rgba(0, 0, 0, 0.7); padding: 3px;",
            overlay_scrollbars: true,
        });
        this._scroll.add_actor(this._box);
        this.actor = new St.BoxLayout({
            opacity: 0
        });
        this.actor.add_actor(this._scroll);

        this._show_terms(this._word, this._data);
    },

    _show_terms: function(word, dict_data) {
        for (let i = 0; i < dict_data.length; i++) {
            let pos = dict_data[i][0]; //.pos;
            let terms = dict_data[i][1]; // jshint ignore:line
            let entry = dict_data[i][2]; //.entry;

            if ($.is_blank(pos)) continue;

            let dictionary_pos = new DictionaryPOS(pos, word);

            for (let k = 0; k < entry.length; k++) {
                let dictionary_entry = new DictionaryEntry(
                    entry[k][0], //.word
                    entry[k][1] //.reverse_translation
                );
                dictionary_pos.add_entry(dictionary_entry);
            }

            this._box.add(dictionary_pos.actor, {
                expand: true
            });
        }
    },

    show: function() {
        this.actor.opacity = 0;

        Tweener.removeTweens(this.actor);
        Tweener.addTween(this.actor, {
            opacity: 255,
            time: 0.3,
            transition: "easeOutQuad"
        });
    },

    hide: function(destroy) {
        Tweener.removeTweens(this.actor);
        Tweener.addTween(this.actor, {
            opacity: 0,
            time: 0.3,
            transition: "easeOutQuad",
            onComplete: Lang.bind(this, function() {
                if (destroy) this.destroy();
            })
        });
    },

    set_size: function(width, height) {
        this._scroll.width = width;
        this._scroll.height = height;
    },

    destroy: function() {
        this.actor.destroy();
        this._data = null;
    }
};

function Translator(extension_object) {
    this._init(extension_object);
}

Translator.prototype = {
    __proto__: $.TranslationProviderBase.prototype,

    _init: function(extension_object) {
        $.TranslationProviderBase.prototype._init.call(this, NAME, LIMIT * MAX_QUERIES, "");
        this._results = [];
        this._extension_object = extension_object;
    },

    _show_dict: function(word, json_data) {
        this._hide_dict();

        this._dict = new Dictionary(word, json_data);
        this._dict.set_size(
            this._extension_object._dialog.target.actor.width,
            this._extension_object._dialog.target.actor.height * 0.85
        );
        this._extension_object._dialog._table.add(this._dict.actor, {
            row: 2,
            col: 1,
            x_fill: false,
            y_fill: false,
            y_align: St.Align.END,
            x_align: St.Align.MIDDLE
        });
        this._dict.show();
    },

    _hide_dict: function() {
        if (this._dict) {
            this._dict.hide(true);
        }
    },

    _split_text: function(text) {
        let sentences = text.match(SENTENCES_REGEXP);

        if (sentences === null) {
            return false;
        }

        let temp = "";
        let result = [];

        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i];

            if ($.is_blank(sentence)) {
                temp += "\n";
                continue;
            }

            if (sentence.length + temp.length > LIMIT) {
                result.push(temp);
                temp = sentence;
            } else {
                temp += sentence;
                if (i == (sentences.length - 1)) result.push(temp);
            }
        }

        return result;
    },

    get_pairs: function(language) { // jshint ignore:line
        let temp = {};

        for (let key in $.LANGUAGES_LIST) {
            if (key === "auto")
                continue;

            temp[key] = $.LANGUAGES_LIST[key];
        }

        return temp;
    },

    parse_response: function(data) {
        let stuff = {
            "\x1B[1m": "<b>",
            "\x1B[22m": "</b>",
            "\x1B[4m": "<u>",
            "\x1B[24m": "</u>"
        };
        try {
            for (let hex in stuff) {
                data = $.replaceAll(data, hex, stuff[hex]);
            }
            return data;
        } catch (aErr) {
            return "%s: ".format(_("Error while parsing data")) + aErr;
        }
    },

    do_translation: function(source_lang, target_lang, text, callback) {
        var proxy = false;
        if ($.execSync("gsettings get org.gnome.system.proxy mode") == "manual") {
            proxy = $.execSync("gsettings get org.gnome.system.proxy.http host").slice(1, -1);
            proxy += ":";
            proxy += $.execSync("gsettings get org.gnome.system.proxy.http port");
        }

        let command = ["trans"];
        let options = [
            "-e", "google",
            // "-brief",
            // "-no-theme",
            "--show-original", "n",
            "--show-languages", "n",
            "--show-prompt-message", "n",
            "--no-bidi",
        ]; /*--show-original n --show-languages n  --show-prompt-message n --no-bidi*/
        let subjects = [
            (source_lang === "auto" ? "" : source_lang) + ":" + target_lang,
            text
        ];

        if (proxy) {
            options.push("-x");
            options.push(proxy);
        }

        let _this = this;
        $.exec(command.concat(options).concat(subjects), function(data) {
            if (!data) {
                data = _("Error while translating, check your internet connection");
            } else {
                data = _this.parse_response(data);
            }
            callback(data);
        });
    },

    translate: function(source_lang, target_lang, text, callback) {
        if ($.is_blank(text)) {
            callback(false);
            return;
        }

        let splitted = this._split_text(text);

        if (!splitted || splitted.length === 1) {
            if (splitted) text = splitted[0];

            this.do_translation(source_lang, target_lang, text, callback);
        } else {
            this._results = [];
            let _this = this;
            $.asyncLoop({
                length: splitted.length,
                functionToLoop: Lang.bind(this, function(loop, i) {
                    let text = splitted[i];
                    let data = _this.do_translation(source_lang, target_lang, text, function() {
                        this._results.push(data);
                        loop();
                    });
                }),
                callback: Lang.bind(this, function() {
                    callback(this._results.join(" "));
                })
            });
        }
    },
};
