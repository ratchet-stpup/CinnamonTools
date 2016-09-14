## Custom Cinnamon Menu applet description

This applet is a custom version of the default Cinnamon Menu applet, but infinitely more customizable.

## Compatibility

Tested and working on Cinnamon version 3.0.7.

## Added options/features

- The separator between **Favorites** box and **Quit** box can have a custom height. I couldn't find a way to make this flexible or automatic.
- The searchbox can be moved to the bottom or completely hidden. It can also have a fixed width or an automatic width to fit the menu width.
- The applications info box (that thing that is used instead of a good old tooltip ¬¬) can be hidden.
- The size of the Favorites/Categories/Applications icons can be customized.
- The amount of recent files can be customized.
- The **Quit** buttons can be hidden all at once or individually.
- The **Recent Files** category can be hidden. This is for people who want the **Recent Files** category hidden without disabling recent files globally.
- Added Fuzzy search. Based on [Sane Menu](https://cinnamon-spices.linuxmint.com/applets/view/258s) applet by **nooulaif**.
- Added a custom launchers box that can run any command/script/file and can be placed at the top/bottom of the menu or to the left/right of the searchbox.
- Custom launchers icons can have a custom size and can be symbolic or full color.
- Custom launchers can execute any command (as entered in a terminal) or a path to a file. If the file is an executable script, an attempt to execute it will be made. Otherwise, the file will be opened with the systems handler for that file type.
- The **Quit buttons** can now be moved next the the custom launchers box and can have custom icons (ONLY when they are placed next to the custom launchers box).
- The **All Applications** category can be removed from the menu.
- The **Favorites** can now be displayed as one more category. The **All Applications** category has to be hidden.
- The placement of the categories box and the applications box can be swapped.
- Scrollbars in the applications box can be hidden.
- The padding of certain menu elements can be customized to override the current theme stylesheets.
- Recently installed applications highlighting can be disabled.
- Recently used applications can be remembered and will be displayed on a category called **Recent Apps**. The applications will be sorted by execution time and the name and icon of the category can be customized.

### Menu *emulating* the Whisker menu (XFCE)

![Whisker menu](https://raw.githubusercontent.com/Odyseus/CinnamonTools/master/Applets/0dyseus%40CustomCinnamonMenu/screenshot2.png "Whisker menu")

<h2 style="color:red;"> Bug report and feature request</h2>
<span style="color:red;">
Spices comments system is absolutely useless to report bugs with any king of legibility. In addition, there is no notifications system for new comments. So, if anyone has bugs to report or a feature request, do so on this applet GitHub page. Just click the **Website** button next to the **Download** button.
</span>

## Change Log

##### 1.05
- Added new option to remember recently used applications launched from the menu. These applications will be displayed on a new category and sorted by execution time.
- Added some tweaks and new features from the nightly version of the default Cinnamon menu. These additions make this applet *play nice* with the new vertical panels introduced by Cinnamon nightly.
- Some fixes to the menu keyboard navigation. There were some inconsistencies when the option **Swap categories box** was enabled. There are still some inconsistencies when the favorites box is shown. I will fix them when I figure out how to.

##### 1.04
- Added option to place the custom launchers box to the left or to the right of the searchbox.
- Added option to auto set the searchbox width to fit the entire menu width.
- Added option to align the applications info box text to the left.

##### 1.03
- Added option to invert the placement of the categories box and the applications box.
- Added option to display the **Favorites** as a category.
- Added option to remove the (totally useless) **All applications** category.
- Added option to hide the scrollbar from the applications list.
- Added option to disable recently installed applications highlighting.
- Added options to customize the padding of certain menu elements.

##### 1.02
- Added option to hide searchbox.
- Added option to set a fixed width for the searchbox.
- Added a box that can contain any custom launcher (up to 10) and can be placed at the top or the bottom of the menu.
- The **Quit buttons** can now be moved next the the custom launchers box.
- The **Quit buttons** can now have custom icons (ONLY when they are placed next to the custom launchers box).

##### 1.01
- Minor performance tweaks.

##### 1.0
- Initial release.

