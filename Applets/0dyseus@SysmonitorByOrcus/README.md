## System Monitor fork applet description

This applet is a fork of [System Monitor](https://cinnamon-spices.linuxmint.com/applets/view/88) applet by Josef Michálek (Aka Orcus).

## Dependencies

- **gir1.2-gtop-2.0**: The gtop library reads information about processes and the state of the
system.
- **gjs**: Makes it possible for applications to use all of GNOME's platform
libraries using the Javascript language. It's used by this applet to create its settings window.

## Differences with the original
- I enabled the use of alpha to all the color pickers in the settings window.
- I added a notification in case the User doesn't have installed the gjs package to make this applet settings window to work.

## Change Log

##### 1.4
- Initial release of the fork.

