<h4 style="color:red;font-weight:bold;">
This change log is only valid for the version of the xlet hosted on <a href="https://github.com/Odyseus/CinnamonTools">its original repository</a>
</h4>
***
- **Date:** Wed, 17 May 2017 16:08:42 -0300
- **Commit:** [c9635bb](https://github.com/Odyseus/CinnamonTools/commit/c9635bb)
- **Author:** Odyseus
```
Popup Translator applet
- Removed CJS 3.4 warnings and fixed errors exposed by the use of CJS 3.4.

LANGUAGE  UNTRANSLATED
zh_CN.po  0
de.po     64
es.po     0
cs.po     64
sv.po     0
ru.po     63
hr.po     63

```

***

- **Date:** Mon, 15 May 2017 00:40:29 -0300
- **Commit:** [0482416](https://github.com/Odyseus/CinnamonTools/commit/0482416)
- **Author:** Odyseus
```
Popup Translator applet
- Re-generated help file based on new localizations.

LANGUAGE  UNTRANSLATED
zh_CN.po  0
de.po     64
es.po     0
cs.po     64
sv.po     0
ru.po     63
hr.po     63

```

***

- **Date:** Mon, 15 May 2017 00:19:05 -0300
- **Commit:** [bf4b875](https://github.com/Odyseus/CinnamonTools/commit/bf4b875)
- **Author:** Odyseus
```
Merge pull request #81 from giwhub/giwhub-patch-2
Update Chinese translations for xlets
```

***

- **Date:** Sun, 14 May 2017 23:50:48 -0300
- **Commit:** [c85c9d2](https://github.com/Odyseus/CinnamonTools/commit/c85c9d2)
- **Author:** Odyseus
```
General
- Updated helper.sh script so it updates copies of the .po files instead of the original ones to get
the count of untranslated strings.
- Updated all localization templates.

```

***

- **Date:** Mon, 15 May 2017 00:05:12 +0800
- **Commit:** [20d3547](https://github.com/Odyseus/CinnamonTools/commit/20d3547)
- **Author:** giwhub
```
Update zh_CN.po

```

***

- **Date:** Sun, 14 May 2017 10:45:55 +0200
- **Commit:** [ede71a6](https://github.com/Odyseus/CinnamonTools/commit/ede71a6)
- **Author:** Åke Engelbrektson
```
Update sv.po

```

***

- **Date:** Sat, 13 May 2017 20:54:56 -0300
- **Commit:** [67fe7a7](https://github.com/Odyseus/CinnamonTools/commit/67fe7a7)
- **Author:** Odyseus
```
Popup Translator applet
- Redesigned help file generation. Now the help file is created from a python script
(create_localized_help.py) from which strings can be extracted by xgettext to be added to the xlet
localization template to be able to localize the content of the help file.

LANGUAGE  UNTRANSLATED
zh_CN.po  64
de.po     64
es.po     0
cs.po     64
sv.po     64
ru.po     63
hr.po     63

```

***

- **Date:** Mon, 8 May 2017 13:17:41 +0200
- **Commit:** [2ff4770](https://github.com/Odyseus/CinnamonTools/commit/2ff4770)
- **Author:** muzena
```
0dyseus@PopupTranslator.hr: update hr.po

```

***

- **Date:** Sun, 7 May 2017 12:50:34 -0300
- **Commit:** [43e4be1](https://github.com/Odyseus/CinnamonTools/commit/43e4be1)
- **Author:** Odyseus
```
Popup Translator applet
- Added Russian localization. Thanks to [Ilis](https://github.com/Ilis).

```

***

- **Date:** Sun, 7 May 2017 08:40:15 -0300
- **Commit:** [119fbb4](https://github.com/Odyseus/CinnamonTools/commit/119fbb4)
- **Author:** Odyseus
```
Popup Translator applet
- Removed *multiversion* because it is not worth the trouble. Fixes #60

```

***

- **Date:** Sun, 7 May 2017 06:00:10 -0300
- **Commit:** [d2feeab](https://github.com/Odyseus/CinnamonTools/commit/d2feeab)
- **Author:** Odyseus
```
Popup Translator applet
- Corrected execution permission for appletHelper.py file. Fixes #58

```

***

- **Date:** Sat, 6 May 2017 09:32:30 -0300
- **Commit:** [133c566](https://github.com/Odyseus/CinnamonTools/commit/133c566)
- **Author:** Odyseus
```
General
- Reverted the wrapping with double quotes of all path arguments passed to the Util.spawn_async
function. It caused more damage than good.
- Some minor code clean up.
- Updated packages.

```

***

- **Date:** Sat, 6 May 2017 08:26:11 -0300
- **Commit:** [03905d6](https://github.com/Odyseus/CinnamonTools/commit/03905d6)
- **Author:** Odyseus
```
Popup Translator applet
- Cleaned up metadata.json file.

```

***

- **Date:** Fri, 5 May 2017 13:27:16 -0300
- **Commit:** [7ac5e79](https://github.com/Odyseus/CinnamonTools/commit/7ac5e79)
- **Author:** Odyseus
```
Popup Translator applet
- Minor code tweaks.

```

***

- **Date:** Thu, 4 May 2017 03:21:24 -0300
- **Commit:** [1df6d6d](https://github.com/Odyseus/CinnamonTools/commit/1df6d6d)
- **Author:** Odyseus
```
Popup Translator applet
- Fixed Google Translate language detection due to changes on Google's side.

```

***

- **Date:** Thu, 4 May 2017 00:07:55 -0300
- **Commit:** [732cc11](https://github.com/Odyseus/CinnamonTools/commit/732cc11)
- **Author:** Odyseus
```
Popup Translator applet
- Changed *multiversion* implementation. Created symlinks inside the version folder so I don't keep
forgetting to copy the files from the root folder. The only *unique* file, and the only reason that
I use *multiversion*, is the settings-schema.json file.
- Changed the way the imports are done.
- Removed *dangerous* flag. Achieved by changing all synchronous functions to their asynchronous
counterparts.
- General code clean up.

```

***

- **Date:** Sun, 30 Apr 2017 01:07:28 -0300
- **Commit:** [22018e1](https://github.com/Odyseus/CinnamonTools/commit/22018e1)
- **Author:** Odyseus
```
Popup Translator applet
- Updated README and metadata.json file to reflect new localization.

```

***

- **Date:** Sat, 29 Apr 2017 12:25:39 +0200
- **Commit:** [ae74239](https://github.com/Odyseus/CinnamonTools/commit/ae74239)
- **Author:** Åke Engelbrektson
```
Create sv.po
Swedish translation

```

***

- **Date:** Sat, 22 Apr 2017 15:57:59 -0300
- **Commit:** [51f6a1f](https://github.com/Odyseus/CinnamonTools/commit/51f6a1f)
- **Author:** Odyseus
```
General
- Corrected a grammatical error in all xlet's localized help files.

```

***

- **Date:** Thu, 13 Apr 2017 15:52:02 -0300
- **Commit:** [cdc12c5](https://github.com/Odyseus/CinnamonTools/commit/cdc12c5)
- **Author:** Odyseus
```
Popup Translator applet - Added localized help.

```

***

- **Date:** Sat, 1 Apr 2017 15:22:10 -0300
- **Commit:** [e2de9c0](https://github.com/Odyseus/CinnamonTools/commit/e2de9c0)
- **Author:** Odyseus
```
General - Updated all help files
- Updated packages.

```

***

- **Date:** Wed, 8 Mar 2017 19:32:32 -0300
- **Commit:** [c64d7b0](https://github.com/Odyseus/CinnamonTools/commit/c64d7b0)
- **Author:** Odyseus
```
General - Updated all xlet's READMEs again. ¬¬

```

***

- **Date:** Tue, 7 Mar 2017 16:57:56 -0300
- **Commit:** [ee79f02](https://github.com/Odyseus/CinnamonTools/commit/ee79f02)
- **Author:** Odyseus
```
General - Added Croatian localization to all xlets. Thanks to [muzena](https://github.com/muzena)
- Added LICENSE file to all xlets
- Updated packages.

```

***

- **Date:** Tue, 7 Mar 2017 22:50:20 +0800
- **Commit:** [fb8eb5b](https://github.com/Odyseus/CinnamonTools/commit/fb8eb5b)
- **Author:** giwhub
```
Create zh_CN.po

```

***

- **Date:** Thu, 2 Mar 2017 15:11:20 -0300
- **Commit:** [19b3c11](https://github.com/Odyseus/CinnamonTools/commit/19b3c11)
- **Author:** Odyseus
```
General - Updated metadata.json files.

```

***

- **Date:** Sun, 26 Feb 2017 20:45:00 -0300
- **Commit:** [22f71d7](https://github.com/Odyseus/CinnamonTools/commit/22f71d7)
- **Author:** Odyseus
```
General - Updated all READMEs and help files.

```

***

- **Date:** Tue, 21 Feb 2017 08:10:00 -0300
- **Commit:** [11896be](https://github.com/Odyseus/CinnamonTools/commit/11896be)
- **Author:** Odyseus
```
General - Updated packages
- Updated main site
- Fixed some links to the wiki pages.

```

***

- **Date:** Sun, 19 Feb 2017 12:41:46 -0300
- **Commit:** [ecb040e](https://github.com/Odyseus/CinnamonTools/commit/ecb040e)
- **Author:** Odyseus
```
Popup Translator applet - Updated German and Czech localizations.

```

***

- **Date:** Sun, 19 Feb 2017 17:15:37 -0300
- **Commit:** [1dd24b8](https://github.com/Odyseus/CinnamonTools/commit/1dd24b8)
- **Author:** Odyseus
```
General - Implemented rendering of xlets' help files to HTML.

```

***

- **Date:** Mon, 13 Feb 2017 20:21:15 -0300
- **Commit:** [b0b63ca](https://github.com/Odyseus/CinnamonTools/commit/b0b63ca)
- **Author:** Odyseus
```
General - Updated README files of all xlets
- Fixed broken links on main README file.

```

***

- **Date:** Sun, 12 Feb 2017 00:51:31 -0300
- **Commit:** [41ca677](https://github.com/Odyseus/CinnamonTools/commit/41ca677)
- **Author:** Odyseus
```
Popup Translator applet - Fixed keybindings not registered on applet initialization
- Implemented 4 different translation mechanisms that will allow to have various translation options
at hand without the need to constantly change the applet settings. Read the HELP.md file for more
details (It can be accessed from this applet context menu)
- Re-designed the translation history mechanism to be *smarter*. Now, if, for example, a string is
translated into four different languages, the strings will be stored into four different entries in
the translation history
- Re-designed the translation history window. Now, only one instance of the history window can be
opened at the same time. Removed **Reload** button in favor of auto-update of the history window
content every time the translation history changes and the translation window is open
- Moved some of the context menu entries into a sub-menu
- Removed unused import from appletHelper.py file
- Added new icons to the icons folder that represent the translation services used by this applet
- Added debugging options to facilitate development
- Added LICENSE.md file to applet.

```

***

- **Date:** Mon, 6 Feb 2017 18:14:08 -0300
- **Commit:** [2ecca71](https://github.com/Odyseus/CinnamonTools/commit/2ecca71)
- **Author:** Odyseus
```
Popup Translator applet - Fixed keybinding display on applet tooltip.

```

***

- **Date:** Fri, 3 Feb 2017 14:05:11 -0300
- **Commit:** [4ae3b18](https://github.com/Odyseus/CinnamonTools/commit/4ae3b18)
- **Author:** Odyseus
```
Popup Translator applet - Added German localization. Thanks to
[NikoKrause](https://github.com/NikoKrause).

```

***

- **Date:** Thu, 2 Feb 2017 17:33:00 -0300
- **Commit:** [69b6e72](https://github.com/Odyseus/CinnamonTools/commit/69b6e72)
- **Author:** Odyseus
```
Popup Translator applet - Added Czech localization. Thanks to [Radek71](https://github.com/Radek71).
Closes #21 - Added missing translatable strings
- Improved clean up when removing applet.

```

***

- **Date:** Wed, 1 Feb 2017 15:23:43 -0300
- **Commit:** [b2416fe](https://github.com/Odyseus/CinnamonTools/commit/b2416fe)
- **Author:** Odyseus
```
Popup Translator applet - First stable version
- Initial Spices publication.

```

***

- **Date:** Tue, 31 Jan 2017 19:07:54 -0300
- **Commit:** [324a1d2](https://github.com/Odyseus/CinnamonTools/commit/324a1d2)
- **Author:** Odyseus
```
General - General repository rearrangement.

```

***
- **Date:** Tue, 31 Jan 2017 19:07:54 -0300
- **Commit:** [324a1d2](https://github.com/Odyseus/CinnamonTools/commit/324a1d2)
- **Author:** Odyseus
```
General - General repository rearrangement.

```

***

- **Date:** Tue, 31 Jan 2017 15:32:16 -0300
- **Commit:** [dc7a8b7](https://github.com/Odyseus/CinnamonTools/commit/dc7a8b7)
- **Author:** Odyseus
```
Popup Translator applet - Sixth prototype
- Removed the history.ui file and placed its content inside the appletHelper.py file
- Translatable strings untouched.

```

***

- **Date:** Sun, 29 Jan 2017 14:55:52 -0300
- **Commit:** [744a2c4](https://github.com/Odyseus/CinnamonTools/commit/744a2c4)
- **Author:** Odyseus
```
Popup Translator applet - Fifth prototype
- Tested on Cinnamon 2.8.8, 3.0.7 and 3.2.8
- Translatable strings might need corrections.

```

***

- **Date:** Sun, 29 Jan 2017 08:52:57 -0300
- **Commit:** [b9a2a5e](https://github.com/Odyseus/CinnamonTools/commit/b9a2a5e)
- **Author:** Odyseus
```
Popup Translator applet - Fourth prototype.

```

***

- **Date:** Fri, 27 Jan 2017 11:40:53 -0300
- **Commit:** [554371e](https://github.com/Odyseus/CinnamonTools/commit/554371e)
- **Author:** Odyseus
```
Applet - Cleaned some irrelevant files
- Updated READMEs
- Updated metadata.json
- Updated some applet icons.

```

***

- **Date:** Tue, 24 Jan 2017 09:27:42 -0300
- **Commit:** [54bb97a](https://github.com/Odyseus/CinnamonTools/commit/54bb97a)
- **Author:** Odyseus
```
Popup Translator - Third prototype.

```

***

- **Date:** Mon, 23 Jan 2017 04:51:14 -0300
- **Commit:** [13a5214](https://github.com/Odyseus/CinnamonTools/commit/13a5214)
- **Author:** Odyseus
```
Popup Translator - Second prototype.

```

***

- **Date:** Mon, 23 Jan 2017 04:49:30 -0300
- **Commit:** [788e8c5](https://github.com/Odyseus/CinnamonTools/commit/788e8c5)
- **Author:** Odyseus
```
General - Fixed some broken links on READMEs
- Fixed wrong author name on info.json files.

```

***

- **Date:** Sun, 22 Jan 2017 20:29:22 -0300
- **Commit:** [c2a6759](https://github.com/Odyseus/CinnamonTools/commit/c2a6759)
- **Author:** Odyseus
```
Applets - Formatted repository to conform Spices repository.

```

***

- **Date:** Wed, 18 Jan 2017 04:05:44 -0300
- **Commit:** [7260278](https://github.com/Odyseus/CinnamonTools/commit/7260278)
- **Author:** Odyseus
```
[General] Stage 1
- Added badges
- Updated READMEs
- Added packaged xlets/themes to be able to download individually.

```

***

- **Date:** Sun, 15 Jan 2017 05:42:06 -0300
- **Commit:** [5d111a7](https://github.com/Odyseus/CinnamonTools/commit/5d111a7)
- **Author:** Odyseus
```
[Popup Translator applet] - Initial prototype.

```

***
