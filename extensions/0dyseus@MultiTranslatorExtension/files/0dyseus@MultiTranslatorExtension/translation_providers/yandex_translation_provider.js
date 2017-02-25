const ExtensionUUID = "0dyseus@MultiTranslatorExtension";
const Gettext = imports.gettext;

function _(aStr) {
    let customTrans = Gettext.dgettext(ExtensionUUID, aStr);

    if (customTrans != aStr)
        return customTrans;

    return Gettext.gettext(aStr);
}

imports.searchPath.push(imports.ui.extensionSystem.extensionMeta[ExtensionUUID].path);

var $ = imports[ExtensionUUID];

const KEY = "trnsl.1.1.20131012T133604Z.058afe97adb43930.4289d5089e7cf72449ffcefc1c623e76f5f281dd";
const NAME = "Yandex.Translate";
const LIMIT = 9800;
const PROVIDER_URL = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + KEY + "&lang=%s-%s&text=%s";

const LANGUAGE_PAIRS = [
    "az-ru",
    "be-bg",
    "be-cs",
    "be-de",
    "be-en",
    "be-es",
    "be-fr",
    "be-it",
    "be-pl",
    "be-ro",
    "be-ru",
    "be-sr",
    "be-tr",
    "bg-be",
    "bg-ru",
    "bg-uk",
    "ca-en",
    "ca-ru",
    "cs-be",
    "cs-en",
    "cs-ru",
    "cs-uk",
    "da-en",
    "da-ru",
    "de-be",
    "de-en",
    "de-es",
    "de-fr",
    "de-it",
    "de-ru",
    "de-tr",
    "de-uk",
    "el-en",
    "el-ru",
    "en-be",
    "en-ca",
    "en-cs",
    "en-da",
    "en-de",
    "en-el",
    "en-es",
    "en-et",
    "en-fi",
    "en-fr",
    "en-hu",
    "en-it",
    "en-lt",
    "en-lv",
    "en-mk",
    "en-nl",
    "en-no",
    "en-pt",
    "en-ru",
    "en-sk",
    "en-sl",
    "en-sq",
    "en-sv",
    "en-tr",
    "en-uk",
    "es-be",
    "es-de",
    "es-en",
    "es-ru",
    "es-uk",
    "et-en",
    "et-ru",
    "fi-en",
    "fi-ru",
    "fr-be",
    "fr-de",
    "fr-en",
    "fr-ru",
    "fr-uk",
    "hr-ru",
    "hu-en",
    "hu-ru",
    "hy-ru",
    "it-be",
    "it-de",
    "it-en",
    "it-ru",
    "it-uk",
    "lt-en",
    "lt-ru",
    "lv-en",
    "lv-ru",
    "mk-en",
    "mk-ru",
    "nl-en",
    "nl-ru",
    "no-en",
    "no-ru",
    "pl-be",
    "pl-ru",
    "pl-uk",
    "pt-en",
    "pt-ru",
    "ro-be",
    "ro-ru",
    "ro-uk",
    "ru-az",
    "ru-be",
    "ru-bg",
    "ru-ca",
    "ru-cs",
    "ru-da",
    "ru-de",
    "ru-el",
    "ru-en",
    "ru-es",
    "ru-et",
    "ru-fi",
    "ru-fr",
    "ru-hr",
    "ru-hu",
    "ru-hy",
    "ru-it",
    "ru-lt",
    "ru-lv",
    "ru-mk",
    "ru-nl",
    "ru-no",
    "ru-pl",
    "ru-pt",
    "ru-ro",
    "ru-sk",
    "ru-sl",
    "ru-sq",
    "ru-sr",
    "ru-sv",
    "ru-tr",
    "ru-uk",
    "sk-en",
    "sk-ru",
    "sl-en",
    "sl-ru",
    "sq-en",
    "sq-ru",
    "sr-be",
    "sr-ru",
    "sr-uk",
    "sv-en",
    "sv-ru",
    "tr-be",
    "tr-de",
    "tr-en",
    "tr-ru",
    "tr-uk",
    "uk-bg",
    "uk-cs",
    "uk-de",
    "uk-en",
    "uk-es",
    "uk-fr",
    "uk-it",
    "uk-pl",
    "uk-ro",
    "uk-ru",
    "uk-sr",
    "uk-tr"
];

function Translator() {
    this._init(arguments);
}

Translator.prototype = {
    __proto__: $.TranslationProviderBase.prototype,

    _init: function() {
        $.TranslationProviderBase.prototype._init.call(this, NAME, LIMIT, PROVIDER_URL);
    },

    get_languages: function() {
        let temp = {};

        for (let i = 0; i < LANGUAGE_PAIRS.length; i++) {
            let pair = LANGUAGE_PAIRS[i];
            let lang_code = pair.slice(0, 2);
            let lang_name = this.get_language_name(lang_code);

            temp[lang_code] = lang_name;
        }

        return temp;
    },

    get_pairs: function(language) {
        let temp = {};

        for (let i = 0; i < LANGUAGE_PAIRS.length; i++) {
            let pair = LANGUAGE_PAIRS[i];
            let source_lang_code = pair.slice(0, 2);
            let target_lang_code = pair.slice(-2);

            if (source_lang_code.toLowerCase() == language.toLowerCase()) {
                temp[target_lang_code] =
                    $.LANGUAGES_LIST[target_lang_code];
            }
        }

        return temp;
    },

    parse_response: function(response_data) {
        let json;

        try {
            json = JSON.parse(response_data);
        } catch (aErr) {
            global.logError("%s %s: %s".format(
                this.name,
                _("Error"),
                JSON.stringify(aErr, null, "\t")
            ));
            return {
                error: true,
                message: _("Can't translate text, please try later.")
            };
        }

        let result = "";

        if (json.code == 200) {
            result = json.text.join(" ");
        } else {
            result = {
                error: true,
                message: "%s: %s".format(_("Error code"), json.code)
            };
        }

        result = $.escape_html(result);
        return result;
    },

    // translate: function(source_lang, target_lang, text, callback) {
    //     if(source_lang == 'auto') source_lang = '';
    //     this.parent(source_lang, target_lang, text, callback);
    // },
};
