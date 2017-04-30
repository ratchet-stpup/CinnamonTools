
<!--
Notes to translators:
- Do not modify this file directly. Create a copy of it with a different name that contains the language code and always use the .md extension for the file. Example: HELP-es.md file will contain the content of the HELP.md file translated into Spanish.
- This file is written in [markdown](https://guides.github.com/features/mastering-markdown/) and some "touches" of HTML.
- Familiarize yourself with markdown and HTML languages before attempting to translate the content of this file.
- These notes doesn't need to be translated and can be deleted from the translated file.
-->

# Help for Argos for Cinnamon applet

### IMPORTANT!!!
Never delete any of the files found inside this xlet folder. It might break this xlet functionality.

***

<h2 style="color:red;">Bug reports, feature requests and contributions</h2>
<span style="color:red;">
If anyone has bugs to report, a feature request or a contribution, do so on <a href="https://github.com/Odyseus/CinnamonTools">this xlet GitHub page</a>.
</span>

***

## Description

Argos for Cinnamon is an applet that turns executables' standard output into panel dropdown menus. It is inspired by, and fully compatible with, the Gnome Shell extension called [Argos](https://github.com/p-e-w/argos) by [Philipp Emanuel Weidmann](https://github.com/p-e-w), which in turn is inspired by, and fully compatible with, the [BitBar](https://github.com/matryer/bitbar) application for macOS. Argos for Cinnamon supports many [BitBar plugins](https://github.com/matryer/bitbar-plugins) without modifications, giving you access to a large library of well-tested scripts in addition to being able to write your own.

<div class="alert alert-info">
I will use the words <em>plugin</em> or <em>script</em> when referring to a script file associated with an instance on <strong>Argos for Cinnamon</strong> applet.
</div>

***

## Key features

- **100% API [compatible with BitBar 1.9.2](#argos-bitbar-compatibility):** All BitBar plugins that run on Linux (i.e. do not contain macOS-specific code) will work with Argos (else it's a bug).
- **Beyond BitBar:** Argos can do everything that BitBar can do, but also some things that BitBar can't do (yet). See the documentation for details.
- **Sophisticated asynchronous execution engine:** No matter how long your scripts take to run, Argos will schedule them intelligently and prevent blocking.
- **Unicode support:** Just print your text to stdout. It will be rendered the way you expect.
- **Optimized for minimum resource consumption:** Even with multiple plugins refreshing every second, Argos typically uses less than 1% of the CPU.
- **Fully [documented](#argos-usage).**

***

## Examples

***

<span id="argos-usage"></span>
## Usage

After placing a new instance of **Argos for Cinnamon** into a panel, one of the example scripts provided by this applet will be automatically attached to it and a menu will be created based on the output of the executed plugin. These example scripts contain various examples of what **Argos for Cinnamon** can do.

A just placed applet will have an initial execution interval of 0 seconds (zero seconds) and an initial applet text rotation interval of 3 seconds (three seconds). The execution interval is set to 0 seconds because the initial example script doesn't have any dynamic data that requires update. And the applet text rotation interval is set to 3 seconds so the text rotation of the example script can be seen in action.

For scripts that display non dynamic data, it isn't needed an execution interval. But if your script displays dynamic data (a clock for example), then an execution and/or applet text rotation interval needs to be specified. Both of these values can be set from the applet context menu.

<div class="alert alert-info">
The three example scripts provided by this applet will produce the exact same output, but they are created using three different languages (<strong>bash_examples.sh</strong>, <strong>python_examples.py</strong> and <strong>ruby_examples.rb</strong>).
</div>

<div class="alert alert-warning">
<strong>Never save your custom plugins/scripts inside this applet folder. Otherwise, you will loose them all when there is an update for the applet.</strong>
</div>

### File name format

**Argos for Gnome Shell** parses the script's file name to extract certain set of preferences. **Argos for Cinnamon** doesn't parse the script's file name in such way (nor in any other way). All the applet settings can be set from the applet settings window and/or from the applet context menu.

### Output format

Argos plugins are executables (such as shell scripts **(*)**) that print to standard output lines of the following form:

```
TEXT | ATTRIBUTE_1=VALUE ATTRIBUTE_2=VALUE ...
```

All attributes are optional, so the most basic plugins simply print lines consisting of text to be displayed. To include whitespace, attribute values may be quoted using the same convention employed by most command line shells.

<div class="alert alert-info">
<strong>(*) Not just shell scripts, but also python scripts, ruby scripts or any other script in any other language that can print to standard output.</strong>
</div>

### Rendering

Lines containing only dashes (`---`) are *separators*.

Lines above the first separator belong to the applet button itself. If there are multiple such lines, they are displayed in succession, each of them for a configurable amount of time (rotation interval) before switching to the next. Additionally, all button lines get a dropdown menu item, except if their `dropdown` attribute is set to `false`.

Lines below the first separator are rendered as dropdown menu items. Further separators create graphical separator menu items.

Lines beginning with `--` are rendered in a submenu associated with the preceding unindented line. **Argos for Cinnamon** supports unlimited number of nested submenus.

[Emoji codes](http://www.emoji-cheat-sheet.com) like `:horse:` and `:smile:` in the line text are replaced with their corresponding Unicode characters (unless the `emojize` attribute is set to `false`). Note that unpatched Cinnamon does not yet support multicolor emoji.

[ANSI SGR escape sequences](https://en.wikipedia.org/wiki/ANSI_escape_code#graphics) and [Pango markup](https://developer.gnome.org/pango/stable/PangoMarkupFormat.html) tags may be used for styling. This can be disabled by setting the `ansi` and `useMarkup` attributes, respectively, to `false`.

Backslash escapes such as `\n` and `\t` in the line text are converted to their corresponding characters (newline and tab in this case), which can be prevented by setting the `unescape` attribute to `false`. Newline escapes can be used to create multi-line menu items.

***

## Line attributes

### Display

Control how the line is rendered.

| Attribute | Value | Description |
| --- | --- | --- |
| `color` | Hex RGB/RGBA or color name | Sets the text color for the item. |
| `font` | Font name | Sets the font for the item. |
| `size` | Font size in points | Sets the font size for the item. |
| `iconName` | Icon name | Sets a menu icon for the item. See the [freedesktop.org icon naming specification](https://specifications.freedesktop.org/icon-naming-spec/icon-naming-spec-latest.html) for a list of valid names. **Argos only.** **Argos for Cinnamon** also supports a path to an icon file (paths starting with `~/` will be expanded to the user's home folder). |
| `image`, `templateImage` | Base64-encoded image file | Renders an image inside the item. The image is positioned to the left of the text and to the right of the icon. Cinnamon does not have a concept of "template images", so `image` and `templateImage` are interchangeable in Argos. |
| `imageWidth`, `imageHeight` | Width/height in pixels | Sets the dimensions of the image. If only one dimension is specified, the image's original aspect ratio is maintained. **Argos only.** |
| `length` | Length in characters | Truncate the line text to the specified number of characters, ellipsizing the truncated part. |
| `trim` | `true` or `false` | If `false`, preserve leading and trailing whitespace of the line text. |
| `dropdown` | `true` or `false` | If `false` and the line is a button line (see above), exclude it from being displayed in the dropdown menu. |
| `alternate` | `true` or `false` | If `true`, the item is hidden by default, and shown in place of the preceding item when the <kbd>Alt</kbd> key is pressed. |
| `emojize` | `true` or `false` | If `false`, disable substitution of `:emoji_name:` with emoji characters in the line text. |
| `ansi` | `true` or `false` | If `false`, disable interpretation of ANSI escape sequences in the line text. |
| `useMarkup` | `true` or `false` | If `false`, disable interpretation of Pango markup in the line text. **Argos only.** |
| `unescape` | `true` or `false` | If `false`, disable interpretation of backslash escapes such as `\n` in the line text. **Argos only.** |

Attributes available on **Argos for Cinnamon** only.

| Attribute | Value | Description |
| --- | --- | --- |
| `tooltip` | Text to display as toolip | Sets the tooltip for the item. |
| `iconSize` | An integer from 12 to 512 | Sets the size for the item's `iconName`. |
| `iconIsSymbolic` | `true` or `false` | If `false`, the symbolic version of `iconName` will be used on the item (if exists). |

### Actions

Define actions to be performed when the user clicks on the line's menu item.

Action attributes are *not* mutually exclusive. Any combination of them may be associated with the same item, and all actions are executed when the item is clicked.

| Attribute | Value | Description |
| --- | --- | --- |
| `bash` | Bash command | Runs a command using `bash` inside any terminal emulator window. |
| `terminal` | `true` or `false` | If `false`, runs the Bash command in the background (i.e. without opening a terminal window). |
| `param1`, `param2`, ... | Command line arguments | Arguments to be passed to the Bash command. *Note: Provided for compatibility with BitBar only. Argos allows placing arguments directly in the command string.* |
| `href` | URI | Opens a URI in the application registered to handle it. URIs starting with `http://` launch the web browser, while `file://` URIs open the file in its associated default application. **Argos for Cinnamon** also supports paths starting with `~/` that will be automatically expanded to the user's home folder. |
| `eval` | JavaScript code | Passes the code to JavaScript's `eval` function. **Argos only.** |
| `refresh` | `true` or `false` | If `true`, re-runs the plugin, updating its output. |

***

<span id="argos-bitbar-compatibility"></span>
## BitBar plugins with Argos for Cinnamon

<div class="alert alert-warning">
<strong>
WARNING!!! DO NOT RANDOMLY TEST SCRIPTS!!!<br>
1. Apply common sense. Read and understand what a script does and how demanding it could be.<br>
2. Test unknown scripts on an environment from which you can recover easily (i.e. a virtual machine).<br>
3. I found one specific case in which a script can freeze and ultimately crash Cinnamon. It's a script that downloads a GIF image from the internet, converts it to Base64 and then that encoded image is inserted into a menu item using the <code>image</code> attribute. I will not provide a link to that script, but if you follow the very first advice that I listed here, when you see that script, you will know.<br>
</strong>
</div>

These screenshots show how some scripts from the BitBar plugin repository look when rendered by Argos compared to the "canonical" BitBar rendering (macOS screenshots taken from https://getbitbar.com).

| Plugin | BitBar on macOS | Argos on Cinnamon |
| --- | :---: | :---: |
| [**Ping**](https://getbitbar.com/plugins/Network/ping.10s.sh) | ![Ping/BitBar](./assets/bitbar-001.png) | ![Ping/Argos](./assets/argos-001.png) |
| [**Stock Ticker**](https://getbitbar.com/plugins/Finance/gfinance.5m.py) | ![Stock Ticker/BitBar](./assets/bitbar-002.png) | ![Stock Ticker/Argos](./assets/argos-002.png) |
| [**World Clock**](https://getbitbar.com/plugins/Time/worldclock.1s.sh) | ![World Clock/BitBar](./assets/bitbar-003.png) | ![World Clock/Argos](./assets/argos-003.png) |
| [**ANSI**](https://getbitbar.com/plugins/Tutorial/ansi.sh) | ![ANSI/BitBar](./assets/bitbar-004.png) | ![ANSI/Argos](./assets/argos-004.png) |

***

## Applets/Desklets/Extensions (a.k.a. xlets) localization

- If this xlet was installed from Cinnamon Settings, all of this xlet's localizations were automatically installed.
- If this xlet was installed manually and not trough Cinnamon Settings, localizations can be installed by executing the script called **localizations.sh** from a terminal opened inside the xlet's folder.
- If this xlet has no locale available for your language, you could create it by following [these instructions](https://github.com/Odyseus/CinnamonTools/wiki/Xlet-localization) and send the .po file to me.
    - If you have a GitHub account:
        - You could send a pull request with the new locale file.
        - If you don't want to clone the repository, just create a [Gist](https://gist.github.com/) and send me the link.
    - If you don't have/want a GitHub account:
        - You can send me a [Pastebin](http://pastebin.com/) (or similar service) to my [Mint Forums account](https://forums.linuxmint.com/memberlist.php?mode=viewprofile&u=164858).
- If the source text (in English) and/or my translation to Spanish has errors/inconsistencies, feel free to report them.
