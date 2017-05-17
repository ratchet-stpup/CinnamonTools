<h4 style="color:red;font-weight:bold;">
This change log is only valid for the version of the xlet hosted on <a href="https://github.com/Odyseus/CinnamonTools">its original repository</a>
</h4>
***
- **Date:** Mon, 15 May 2017 00:40:50 -0300
- **Commit:** [ff1fa92](https://github.com/Odyseus/CinnamonTools/commit/ff1fa92)
- **Author:** Odyseus
```
Quick Menu applet
- Re-generated help file based on new localizations.

LANGUAGE  UNTRANSLATED
zh_CN.po  0
es.po     0
sv.po     0
hr.po     27

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

- **Date:** Sun, 14 May 2017 11:43:10 -0300
- **Commit:** [85dfff5](https://github.com/Odyseus/CinnamonTools/commit/85dfff5)
- **Author:** Odyseus
```
Quick Menu applet
- Added Swedish localization.
```

***

- **Date:** Sun, 14 May 2017 22:26:44 +0800
- **Commit:** [514db4f](https://github.com/Odyseus/CinnamonTools/commit/514db4f)
- **Author:** giwhub
```
Update zh_CN.po

```

***

- **Date:** Sun, 14 May 2017 10:59:11 +0200
- **Commit:** [e90b599](https://github.com/Odyseus/CinnamonTools/commit/e90b599)
- **Author:** Åke Engelbrektson
```
Update sv.po
Didn't understand the use of ** until later, so here's a minor correction.
```

***

- **Date:** Sun, 14 May 2017 08:35:16 +0200
- **Commit:** [a938f4f](https://github.com/Odyseus/CinnamonTools/commit/a938f4f)
- **Author:** Åke Engelbrektson
```
Create sv.po
Swedish translation
```

***

- **Date:** Sat, 13 May 2017 20:55:21 -0300
- **Commit:** [6a7ab0e](https://github.com/Odyseus/CinnamonTools/commit/6a7ab0e)
- **Author:** Odyseus
```
Quick Menu applet
- Redesigned help file generation. Now the help file is created from a python script
(create_localized_help.py) from which strings can be extracted by xgettext to be added to the xlet
localization template to be able to localize the content of the help file.

LANGUAGE  UNTRANSLATED
zh_CN.po  28
es.po     0
hr.po     27

```

***

- **Date:** Mon, 8 May 2017 13:20:11 +0200
- **Commit:** [0433eee](https://github.com/Odyseus/CinnamonTools/commit/0433eee)
- **Author:** muzena
```
0dyseus@QuickMenu.hr: update hr.po

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

- **Date:** Sat, 6 May 2017 08:25:53 -0300
- **Commit:** [0d246a1](https://github.com/Odyseus/CinnamonTools/commit/0d246a1)
- **Author:** Odyseus
```
Quick Menu applet
- Cleaned up metadata.json file.

```

***

- **Date:** Fri, 5 May 2017 13:27:31 -0300
- **Commit:** [3db31f2](https://github.com/Odyseus/CinnamonTools/commit/3db31f2)
- **Author:** Odyseus
```
Quick Menu applet
- Minor code tweaks.

```

***

- **Date:** Thu, 4 May 2017 05:15:01 -0300
- **Commit:** [13e297d](https://github.com/Odyseus/CinnamonTools/commit/13e297d)
- **Author:** Odyseus
```
Quick Menu applet
- Removed *multiversion* because it is not worth the trouble.
- Removed default main folder set to Desktop. This was done because if the Desktop contains a lot of
files (by the thousands), Cinnamon will simply freeze and/or crash. This happens because Clutter
menus can barely handle large amounts of menu items.
- Moved some prototypes into a separate "modules file".
- Removed *dangerous* flag. Achieved by changing all synchronous functions to their asynchronous
counterparts.
- Some minor code clean up.

```

***

- **Date:** Sun, 30 Apr 2017 01:06:28 -0300
- **Commit:** [8df067c](https://github.com/Odyseus/CinnamonTools/commit/8df067c)
- **Author:** Odyseus
```
Quick Menu applet
- Cleaned metadata.json file.

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

- **Date:** Thu, 13 Apr 2017 16:16:07 -0300
- **Commit:** [e9dfa22](https://github.com/Odyseus/CinnamonTools/commit/e9dfa22)
- **Author:** Odyseus
```
Quick Menu applet - Added localized help.

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

- **Date:** Sat, 18 Mar 2017 04:24:05 -0300
- **Commit:** [00c9ab6](https://github.com/Odyseus/CinnamonTools/commit/00c9ab6)
- **Author:** Odyseus
```
General - Updated READMEs and metadata.json files of several applets with new localizations added.

```

***

- **Date:** Sat, 18 Mar 2017 04:09:36 -0300
- **Commit:** [89ded60](https://github.com/Odyseus/CinnamonTools/commit/89ded60)
- **Author:** Odyseus
```
Merge pull request #33 from giwhub/giwhub-patch-4
Add Chinese translation for Quick Menu
```

***

- **Date:** Fri, 17 Mar 2017 22:46:37 +0800
- **Commit:** [57bc829](https://github.com/Odyseus/CinnamonTools/commit/57bc829)
- **Author:** giwhub
```
Create zh_CN.po

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

- **Date:** Sun, 29 Jan 2017 08:54:59 -0300
- **Commit:** [0f78a83](https://github.com/Odyseus/CinnamonTools/commit/0f78a83)
- **Author:** Odyseus
```
General - Fixed some grammatical errors.

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

- **Date:** Tue, 24 Jan 2017 09:28:18 -0300
- **Commit:** [ca28862](https://github.com/Odyseus/CinnamonTools/commit/ca28862)
- **Author:** Odyseus
```
General - Some fixes to READMEs.

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

- **Date:** Sun, 22 Jan 2017 23:50:00 -0300
- **Commit:** [26e2e87](https://github.com/Odyseus/CinnamonTools/commit/26e2e87)
- **Author:** Odyseus
```
Applets - Fixed some broken links.

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

- **Date:** Tue, 10 Jan 2017 12:29:04 -0300
- **Commit:** [ccaa6ea](https://github.com/Odyseus/CinnamonTools/commit/ccaa6ea)
- **Author:** Odyseus
```
[Quick Menu applet] - Fixed menu breakage after changing main folder under Cinnamon 3.2.x. Fixes #16

```

***

- **Date:** Wed, 21 Dec 2016 04:32:51 -0300
- **Commit:** [68e5308](https://github.com/Odyseus/CinnamonTools/commit/68e5308)
- **Author:** Odyseus
```
[Quick Menu applet] - Improved support for Cinnamon 3.2.x
- Improved hotkey handling
- Improved application's icon recognition for use on the menu items
- Improved support for files launching. Now, if there isn't a handler for certain file types, the
**"Open with"** dialog will appear
- Added support for symbolic links
- Fixed the display of symbolic icons for the applet.

```

***

- **Date:** Wed, 14 Dec 2016 13:57:30 -0300
- **Commit:** [9dd538e](https://github.com/Odyseus/CinnamonTools/commit/9dd538e)
- **Author:** Odyseus
```
[General] - Fixed some grammatical errors.

```

***

- **Date:** Tue, 6 Dec 2016 11:26:43 -0300
- **Commit:** [1bab178](https://github.com/Odyseus/CinnamonTools/commit/1bab178)
- **Author:** Odyseus
```
[General] - Removed unnecessary argument from localizations.sh scripts.

```

***

- **Date:** Thu, 13 Oct 2016 04:59:12 -0300
- **Commit:** [94b488e](https://github.com/Odyseus/CinnamonTools/commit/94b488e)
- **Author:** Odyseus
```
[General] - Added "verbose" and "xtrace" flags to all commands executed by the localizations.sh
scripts.

```

***

- **Date:** Mon, 10 Oct 2016 09:37:32 -0300
- **Commit:** [4fd1c00](https://github.com/Odyseus/CinnamonTools/commit/4fd1c00)
- **Author:** Odyseus
```
[General] Changed all URLs to point to the repository instead of individual folders. Some terms
corrections.

```

***

- **Date:** Fri, 7 Oct 2016 21:09:16 -0300
- **Commit:** [f4440ed](https://github.com/Odyseus/CinnamonTools/commit/f4440ed)
- **Author:** Odyseus
```
[Quick Menu applet] Added option to auto-hide opened sub-menus. Added option to keep the menu open
after activating a menu item. Some code cleaning/corrections.

```

***

- **Date:** Thu, 6 Oct 2016 03:35:15 -0300
- **Commit:** [72668c7](https://github.com/Odyseus/CinnamonTools/commit/72668c7)
- **Author:** Odyseus
```
Corrected some terms and removed BASICS.md in favor of Wiki.

```

***

- **Date:** Mon, 3 Oct 2016 00:12:50 -0300
- **Commit:** [d01a0ab](https://github.com/Odyseus/CinnamonTools/commit/d01a0ab)
- **Author:** Odyseus
```
White space cleaning.

```

***

- **Date:** Sun, 25 Sep 2016 01:37:02 -0300
- **Commit:** [e0afc90](https://github.com/Odyseus/CinnamonTools/commit/e0afc90)
- **Author:** Odyseus
```
Added support for localizations.

```

***

- **Date:** Thu, 15 Sep 2016 07:03:44 -0300
- **Commit:** [9abef36](https://github.com/Odyseus/CinnamonTools/commit/9abef36)
- **Author:** Odyseus
```
Initial commit..

```

***

- **Date:** Wed, 14 Sep 2016 14:23:03 -0300
- **Commit:** [ebdb879](https://github.com/Odyseus/CinnamonTools/commit/ebdb879)
- **Author:** Odyseus
```
Initial commit.

```

***

- **Date:** Fri, 2 Sep 2016 00:22:09 -0300
- **Commit:** [399d924](https://github.com/Odyseus/CinnamonTools/commit/399d924)
- **Author:** Odyseus
```
Initial commit..

```

***

- **Date:** Wed, 31 Aug 2016 12:03:17 -0300
- **Commit:** [51d0a27](https://github.com/Odyseus/CinnamonTools/commit/51d0a27)
- **Author:** Odyseus
```
Initial commit.

```

***

- **Date:** Sat, 20 Aug 2016 14:55:18 -0300
- **Commit:** [8a98d97](https://github.com/Odyseus/CinnamonTools/commit/8a98d97)
- **Author:** Odyseus
```
Initial commit.

```

***

- **Date:** Fri, 12 Aug 2016 05:34:24 -0300
- **Commit:** [08bae8e](https://github.com/Odyseus/CinnamonTools/commit/08bae8e)
- **Author:** Odyseus
```
Initial commit.....

```

***

- **Date:** Sat, 6 Aug 2016 01:11:31 -0300
- **Commit:** [0f07cdc](https://github.com/Odyseus/CinnamonTools/commit/0f07cdc)
- **Author:** Odyseus
```
Initial commit....

```

***

- **Date:** Sat, 6 Aug 2016 01:08:09 -0300
- **Commit:** [af4fe20](https://github.com/Odyseus/CinnamonTools/commit/af4fe20)
- **Author:** Odyseus
```
Initial commit...

```

***

- **Date:** Sat, 6 Aug 2016 00:08:42 -0300
- **Commit:** [1e9eb5b](https://github.com/Odyseus/CinnamonTools/commit/1e9eb5b)
- **Author:** Odyseus
```
Initial commit..

```

***

- **Date:** Fri, 5 Aug 2016 23:54:23 -0300
- **Commit:** [987c2a9](https://github.com/Odyseus/CinnamonTools/commit/987c2a9)
- **Author:** Odyseus
```
Initial commit.

```

***

- **Date:** Fri, 5 Aug 2016 23:37:54 -0300
- **Commit:** [2de29fd](https://github.com/Odyseus/CinnamonTools/commit/2de29fd)
- **Author:** Odyseus
```
Initial commit.

```

***
