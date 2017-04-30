## Description

Wallpaper Changer is an applet based on the gnome-shell extension called [Desk Changer](https://github.com/BigE/desk-changer) by [Eric Gach](https://github.com/BigE). A wallpaper slideshow applet with multiple profiles support.

## Applet status

- Its current state is pretty much its final state.
- I have been using this applet for several months now and the last couple of weeks I started *polishing it*.
- For the time being, there isn't any new feature planned for this applet, just bug fixing if any bug is found.
- The original author of the gnome-shell extension has some plans in mind for adding new features. Whether I port those changes or not depends on those changes being compatible with Cinnamon.
- The applet is ready to be translated, but I would suggest to any willing to translate it to wait until the test face finishes.

## Tested environments

* [x] ![Cinnamon 3.0](https://odyseus.github.io/CinnamonTools/lib/badges/cinn-3.0.svg) ![Linux Mint 18](https://odyseus.github.io/CinnamonTools/lib/badges/lm-18.svg)
* [x] ![Cinnamon 3.2](https://odyseus.github.io/CinnamonTools/lib/badges/cinn-3.2.svg) ![Linux Mint 18.1](https://odyseus.github.io/CinnamonTools/lib/badges/lm-18.1.svg)

<span style="color:red;font-size:large;">
**Important note:** Do not try to install and force compatibility for any other version of Cinnamon older than 3.0.x. As a protection mechanism, the applet will auto-remove itself from the panel.
</span>

## Features

- Possibility to create and switch between several profiles. A profile is simply a list of images and/or folders containing images that this applet will use to switch the wallpaper.
- Possibility to preview the next wallpaper from this applet menu.
- Wallpapers can be switched on demand from the controls found in this applet menu.
- The wallpapers rotation can be alphabetically or random.
- The wallpapers rotation can be defined by an interval in seconds or hourly.
- Possibility to open the next or current wallpapers from this applet menu.
- Possibility to display a notification every time the wallpaper is switched.
- Configurable hotkeys to switch to next/previous wallpaper.
- Read the tooltips of each option on this applet settings window for more details.

**Note:** This applet doesn't complement the Cinnamon option called **Play backgrounds as a slideshow**, it replaces it. The Cinnamon option should be disabled at all times for this applet to work as expected. No worries, nothing *fatal* could happen.

## Images

![screenshot](https://cloud.githubusercontent.com/assets/3822556/25260821/fdf7fefa-2624-11e7-8c25-52be83686015.png)

## Known issues

No known issues for the moment.

## Issue reports

**Issue reporters should adjunct the output of the following commands.**
**Check the content of the log files for sensible information BEFORE running the commands!!!**

`inxi -xxxSc0 -! 31`
`pastebin ~/.cinnamon/glass.log`
`pastebin ~/.xsession-errors`

## [Download Wallpaper Changer applet](https://odyseus.github.io/CinnamonTools/pkg/0dyseus@WallpaperChangerApplet.tar.gz)

## References to anyone that could be interested in testing the applet

@buzz @copecu @fortalezense @maladro1t @NikoKrause @Radek71 @sphh @DamienNZ @muzena @eson57 @giwhub
