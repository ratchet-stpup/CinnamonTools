# Help for Quick Menu applet

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
- If the source text (in English) and/or my translation to Spanish has errors/inconsistencies, feel free to report them.

***

### How to set a different icon for each sub-menu
- Create a file at the same level as the folders that will be used to create the sub-menus.
- The file name can be customized, doesn't need to have an extension name and can be a hidden file (a dot file). By default is called **0_icons_for_sub_menus.json**.
- Whatever name is chosen for the file, it will be automatically ignored and will never be shown on the menu.
- If any sub-folder has more folders that need to have custom icons, just create another **0_icons_for_sub_menus.json** file at the same level that those folders.
- The content of the file is a *JSON object* and has to look as follows:
```json
{
    "Folder name 1": "Icon name or icon path for Folder name 1",
    "Folder name 2": "Icon name or icon path for Folder name 2",
    "Folder name 3": "Icon name or icon path for Folder name 3",
    "Folder name n": "Icon name or icon path for Folder name n"
}
```

**Warning!!!** JSON *"language"* is very strict. Just be sure to ONLY use double quotes. And the last key/value combination DOESN'T have to end with a comma (**Folder name n** in the previous example).
