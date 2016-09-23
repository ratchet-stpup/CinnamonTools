# Help for Custom Cinnamon Menu applet

### IMPORTANT!!!
Never delete any of the files found inside this applet folder. It might break this applet functionality.

***

### Applet localization

- If this applet was installed from Cinnamon Settings, all of these applet's localizations where automatically installed.
- If this applet was installed manually and not trough Cinnamon Settings, localizations can be installed by executing the script called **localizations.sh** from a terminal opened inside the applet's folder.
- If this applet has no locale available for your language, you could create it by following [these instructions](https://github.com/Odyseus/CinnamonTools/blob/master/BASICS.md#how-to-localize-applets) and send the .po file to me.
    - If you have a GitHub account:
        - You could send a pull request with the new locale file.
        - If you don want to clone the repository, just create a Gist and send me the link.
    - If you don't have/want a GitHub account:
        - You can send me a [Pastebin](http://pastebin.com/) (or similar service) to my [Mint Forums account](https://forums.linuxmint.com/memberlist.php?mode=viewprofile&u=164858).

***

### Applications left click extra actions
When left clicking an application on the menu, certain key modifiers can be pressed to execute an application in a special way.

- **Shift + Left click:** Executes application as root.
- **Ctrl + Left click:** Open a terminal and run application from there.
- **Ctrl + Shift + Left click:** Open a terminal and run application from there, but the application is executed as root.

***

### About "Run from terminal" options

These options are meant for debugging purposes (to see the console output after opening/closing a program to detect possible errors). Instead of opening a terminal to launch a program of which one might not know its command, one can do it directly from the menu and in just one step. Options to run from a terminal an application listed on the menu can be found on the applications context menu and can be hidden/shown from this applet settings window.

By default, these options will use the system's default terminal emulator (**x-terminal-emulator**). Any other terminal emulator can be specified inside the settings window of this applet, as long as said emulator has support for the **-e** argument. I did my tests with **gnome-terminal**, **xterm** and **terminator**. Additional arguments could be passed to the terminal emulator, but it's not supported by me.

***

### Troubleshooting/extra information

1. If the command **x-terminal-emulator** doesn't run the terminal emulator that one wants to be the default, run the following command to set a different default terminal emulator.
    - `sudo update-alternatives --config x-terminal-emulator`
    - Type in the number of the selection and hit enter.

2. There is a file inside this applet directory called **run_from_terminal.sh**. ***Do not remove, rename or edit this file***. Otherwise, all of the *Run from terminal* options will break.

3. There is a folder named **icons** inside this applet directory. It contains several symbolic icons (most of them are from the Faenza icon theme) and each icon can be used directly by name (on a custom launcher, for example).

