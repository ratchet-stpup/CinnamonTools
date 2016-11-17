## Cinnamon Tweaks extension description

This extension adds some options to modify the default behaviour of certain Cinnamon features.

## Compatibility

Tested and working on Cinnamon versions 2.8.6, 3.0.7 and 3.2.

<span style="color:red;font-size:large;">
**Important note:** Do not try to install and force compatibility for any other version of Cinnamon older than 2.8.6. As a protection mechanism, the extension will auto-disable itself.
</span>

## Features/Options

- **Applets/Desklets tweaks:** confirmation dialogs can be added to applet/desklet removal to avoid accidental removal. New items can be added to applets/desklets context menus (**Open applet/desklet folder** and **Edit applet/desklet main file**).
- **Notifications tweaks:** allows changing the notification popups to the bottom of the screen and change its top/bottom/right margins.
- **Window focus tweaks:** allows the activation of windows demanding attention with a keyboard shortcut or forced.
- **Hot corners tweaks:** allows to set a hover activation delay in milliseconds for each hot corner.
- **Tooltips tweaks:** allows to tweak the position and show delay of Cinnamon's UI tooltips.

<h2 style="color:red;"> Bug report and feature request</h2>
<span style="color:red;">
Spices comments system is absolutely useless to report bugs with any king of legibility. In addition, there is no notifications system for new comments. So, if anyone has bugs to report or a feature request, do so on this xlet GitHub page. Just click the **Website** button next to the **Download** button.
</span>

## Change Log

##### 1.04
- Fixed duplication of context menu items after moving an applet in panel edit mode.

##### 1.03
- Added **Tooltips** tweaks (affect only Cinnamon's UI tooltips).
    - The tooltips can have a custom show delay (system default is 300 milliseconds).
    - The tooltips position can be moved to be aligned to the bottom right corner of the mouse cursor, avoiding the cursor to overlap the tooltip text. This tweak is available only for Cinnamon versions older than 3.2.
- Added the posibility to display 2 new menu items to the context menu for applets/desklets.
    - **Open applet/desklet folder:** this context menu item will open the folder belonging to the applet/desklet with the default file manager.
    - **Edit applet/desklet main file:** this context menu item will open the applet's main file (applet.js) or the desklet's main file (desklet.js) with the default text editor.

##### 1.02
- Added **Hot Corners** tweaks (hover activation delay).

##### 1.01
- Refactored extension code to allow easy updates/maintenance.
- Added support for localizations. If someone wants to contribute with translations, the Help.md file inside this extension folder has some pointers on how to do it.
- Re-enabled show/hide animation for notifications on the bottom. Now the animation plays in the right directions.
- Now the distance from panel can be set for notifiations shown at the bottom and at the top.
- Added option to disable notifications animation.
- Added option to customize the notification right margin.
- Merged functionality from [Window demands attention behavior](https://cinnamon-spices.linuxmint.com/extensions/view/40) extension.

##### 1.00
- Initial release.
