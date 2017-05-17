<h4 style="color:red;font-weight:bold;">
This change log is only valid for the version of the xlet hosted on <a href="https://github.com/Odyseus/CinnamonTools">its original repository</a>
</h4>
***
- **Date:** Wed, 17 May 2017 16:07:58 -0300
- **Commit:** [3292235](https://github.com/Odyseus/CinnamonTools/commit/3292235)
- **Author:** Odyseus
```
Argos for Cinnamon applet
- Removed CJS 3.4 warnings and fixed errors exposed by the use of CJS 3.4.

LANGUAGE  UNTRANSLATED
es.po     84

```

***

- **Date:** Mon, 15 May 2017 22:47:54 -0300
- **Commit:** [bc8b65e](https://github.com/Odyseus/CinnamonTools/commit/bc8b65e)
- **Author:** Odyseus
```
Argos for Cinnamon applet
- Some minor code clean up.

LANGUAGE  UNTRANSLATED
es.po     84

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

- **Date:** Sat, 13 May 2017 20:52:00 -0300
- **Commit:** [37601a5](https://github.com/Odyseus/CinnamonTools/commit/37601a5)
- **Author:** Odyseus
```
Argos for Cinnamon applet
- Redesigned help file generation. Now the help file is created from a python script
(create_localized_help.py) from which strings can be extracted by xgettext to be added to the xlet
localization template to be able to localize the content of the help file.

LANGUAGE  UNTRANSLATED
es.po     84

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

- **Date:** Sat, 6 May 2017 08:36:34 -0300
- **Commit:** [4b1af68](https://github.com/Odyseus/CinnamonTools/commit/4b1af68)
- **Author:** Odyseus
```
Argos for Cinnamon applet
- Fourth prototype.
- Changed an internal function that it's used to execute custom commands to use a callback. This
allows for me to display a notification in case a command failed to execute.
- Changed the unit used to display the **Script execution time** and **Output process** time on this
applet tooltip from seconds to milliseconds.
- Cleaned up the metadata.json file.
- Updated localization template.

```

***

- **Date:** Fri, 5 May 2017 15:10:03 -0300
- **Commit:** [f0fb42b](https://github.com/Odyseus/CinnamonTools/commit/f0fb42b)
- **Author:** Odyseus
```
Argos for Cinnamon applet
- Updated help file.

```

***

- **Date:** Fri, 5 May 2017 12:19:33 -0300
- **Commit:** [bde7e9f](https://github.com/Odyseus/CinnamonTools/commit/bde7e9f)
- **Author:** Odyseus
```
Argos for Cinnamon applet
- Third prototype.
- Added tooltip to applet. It will display the script name, the execution interval, the rotation
interval, the amount of time that the script took to launch and the amount of time that the applet
took to process the script's output.
- Tested applet on all versions of Cinnamon.
- Implemented plural forms on some translatable strings. **@translators:** Keep an eye on those in
case there are errors.
- *Strictified* all comparisons. Shortcut for *I changed all == to ===*, etc.
- Implemented a better/more informative way of informing about missing dependencies.

```

***

- **Date:** Wed, 3 May 2017 05:06:34 -0300
- **Commit:** [3d82ee9](https://github.com/Odyseus/CinnamonTools/commit/3d82ee9)
- **Author:** Odyseus
```
Argos for Cinnamon
- Second prototype.
- Added localization support for the python_examples.py script and switched to it as the default
script when the applet is first placed in a panel. This allows to create an example menu localized
if there is a localization language available.

```

***

- **Date:** Sun, 30 Apr 2017 11:37:42 -0300
- **Commit:** [5668bb9](https://github.com/Odyseus/CinnamonTools/commit/5668bb9)
- **Author:** Odyseus
```
Argos for Cinnamon applet
- Initial prototype.

```

***
