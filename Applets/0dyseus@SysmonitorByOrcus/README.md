## System Monitor fork applet description

This applet is a fork of [System Monitor](https://cinnamon-spices.linuxmint.com/applets/view/88) applet by Josef Michálek (a.k.a. Orcus).

## Differences with the original applet
- This applet uses Cinnamon's native settings system instead of an external library (gjs).
- I added an option to use a custom command on applet click.
- I added an option to set a custom width for each graph individually.
- I added an option to align this applet tooltip text to the left. ¬¬

## Compatibility

Tested and working on Cinnamon version 3.0.7.

## Dependencies

- **gir1.2-gtop-2.0**: The gtop library reads information about processes and the state of the
system.

<div style="color:red;" markdown="1">
## Bug report and feature request

Spices comments system is absolutely useless to report bugs with any king of legibility. In addition, there is no notifications system for new comments. So, if anyone has bugs to report or a feature request, do so on this applet GitHub page. Just click the **Website** button next to the **Download** button.
</div>

## Change Log

##### 1.5
- Re-writed to use Cinnamon's native settings system instead of an external library. This allowed me to remove **gjs** as a dependency for this applet.
- Added an option to use a custom command on applet click.
- Added an option to set a custom width for each graph individually.
- Added an option to align this applet tooltip text to the left. ¬¬


##### 1.4
- Initial release of the fork.

