/*
exported toggleLocalizationVisibility,
         docCookies
 */

/* jshint varstmt: false */

/**
 * :: cookies.js ::
 * A complete cookies reader/writer framework with full unicode support.
 * Revision #1 - September 4, 2014
 * https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
 * https://developer.mozilla.org/User:fusionchess
 * This framework is released under the GNU Public License, version 3 or later.
 * http://www.gnu.org/licenses/gpl-3.0-standalone.html
 * Syntaxes:
 * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 * docCookies.getItem(name)
 * docCookies.removeItem(name[, path[, domain]])
 * docCookies.hasItem(name)
 * docCookies.keys()
 */

var docCookies = {
    getItem: function(aKey) {
        if (!aKey)
            return null;

        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" +
                encodeURIComponent(aKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"),
            "$1")) || null;
    },
    setItem: function(aKey, aValue, aEnd, aPath, aDomain, aSecure) {
        if (!aKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(aKey))
            return false;

        var sExpires = "";
        if (aEnd) {
            switch (aEnd.constructor) {
                case Number:
                    sExpires = aEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + aEnd;
                    break;
                case String:
                    sExpires = "; expires=" + aEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + aEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(aKey) + "=" + encodeURIComponent(aValue) + sExpires +
            (aDomain ? "; domain=" + aDomain : "") +
            (aPath ? "; path=" + aPath : "") +
            (aSecure ? "; secure" : "");
        return true;
    },
    removeItem: function(aKey, aPath, aDomain) {
        if (!this.hasItem(aKey))
            return false;

        document.cookie = encodeURIComponent(aKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
            (aDomain ? "; domain=" + aDomain : "") + (aPath ? "; path=" + aPath : "");
        return true;
    },
    hasItem: function(aKey) {
        if (!aKey)
            return false;

        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(aKey).replace(/[\-\.\+\*]/g, "\\$&") +
            "\\s*\\=")).test(document.cookie);
    },
    keys: function() {
        var keys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
            .split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = keys.length, nIdx = 0; nIdx < nLen; nIdx++)
            keys[nIdx] = decodeURIComponent(keys[nIdx]);

        return keys;
    }
};

function toggleLocalizationVisibility(aValue) {
    // Store the language passed to the function or retrieve it from a cookie.
    var language = aValue ? aValue : docCookies.getItem("cinnamon_tools_help_language");
    var selector = document.getElementById("localization-switch");

    // If there is no selector, the page build must have gone very wrong.
    if (!selector)
        return;

    // aValue is null on page load.
    if (aValue === null) {
        // If there is no language is because cookies are not allowed.
        // If a user reloads a help page when another language other than English is shown:
        // - With cookies allowed: The currently selected language will stay selected.
        // - With cookies NOT allowed: The help page will be switched to English.
        if (language) { // Set the chosen (or retrieved from a cookie) language...
            selector.value = language;
        } else { // ...or default to English.
            selector.value = "en";
        }
    }

    try {
        // Hide all sections.
        Array.prototype.slice.call(document.getElementsByClassName("localization-content"))
            .forEach(function(aEl) {
                aEl && aEl.classList.add("hidden");
            });

        var option = selector.options[selector.selectedIndex];
        var chooseLanguageLabel = document.getElementById("localization-chooser-label");
        var navXletHelp = document.getElementById("nav-xlet-help");
        var navXletContributors = document.getElementById("nav-xlet-contributors");
        var navXletChangelog = document.getElementById("nav-xlet-changelog");

        // Set localized "Choose language" label.
        chooseLanguageLabel.innerText = option.getAttribute("data-language-chooser-label");
        // Set localized navbar labels.
        navXletHelp.innerText = option.getAttribute("data-xlet-help");
        navXletContributors.innerText = option.getAttribute("data-xlet-contributors");
        navXletChangelog.innerText = option.getAttribute("data-xlet-changelog");
        // Set localized page title.
        document.title = option.getAttribute("data-title");
    } finally {
        if (language) {
            // If there is language, use it to unhide the respective section...
            document.getElementById(language).classList.remove("hidden");
            // ...and save it into a cookie.
            docCookies.setItem("cinnamon_tools_help_language", language);
        } else {
            // If there is no language, unhide the English section and move on.
            document.getElementById("en").classList.remove("hidden");
        }
    }
}
