
<!--
Notes to translators:
- Do not modify this file directly. Create a copy of it with a different name that contains the language code and always use the .md extension for the file. Example: HELP-es.md file will contain the content of the HELP.md file translated into Spanish.
- This file is written in [markdown](https://guides.github.com/features/mastering-markdown/) and some "touches" of HTML.
- Familiarize yourself with markdown and HTML languages before attempting to translate the content of this file.
- These notes doesn't need to be translated and can be deleted from the translated file.
-->

# Help for Simple ToDo List applet

### IMPORTANT!!!
Never delete any of the files found inside this xlet folder. It might break this xlet functionality.

***

<h2 style="color:red;">Bug reports, feature requests and contributions</h2>
<span style="color:red;">
If anyone has bugs to report, a feature request or a contribution, do so on <a href="https://github.com/Odyseus/CinnamonTools">this xlet GitHub page</a>.
</span>

***

### Applet usage and features

The usage of this applet is very simple. Each task list is represented by a sub menu and each sub menu item inside a sub menu represents a task.

- To add a new tasks list, simply focus the **New tasks list...** entry, give a name to the tasks list and press <kdb>Enter</kdb>.
- To add a new task, simply focus the **New task...** entry, give a name to the task and press <kdb>Enter</kdb>.
- All tasks lists and tasks can be edited in-line.
- Tasks can be marked as completed by changing the checked state of their sub menu items.
- Each tasks list can have its own settings for sorting tasks (by name and/or by completed state), remove task button visibility and completed tasks visibility.
- Each tasks list can be saved as individual TODO files and also can be exported into a file for backup purposes.
- Tasks can be reordered by simply dragging them inside the tasks list they belong to (only if all automatic sorting options for the tasks list are disabled).
- Tasks can be deleted by simply pressing the delete task button (if visible).
- Colorized priority tags support. The background and text colors of a task can be colorized depending on the @tag found inside the task text.
- Configurable hotkey to open/close the menu.
- Read the tooltips of each option on this applet settings window for more details.

***

### Keyboard shortcuts

The keyboard navigation inside this applet menu is very similar to the keyboard navigation used by any other menu on Cinnamon. But it's slightly changed to facilitate tasks and sections handling and edition.

##### When the focus is on a task

- <kdb>Ctrl</kdb> + <kdb>Spacebar</kdb>: Toggle the completed (checked) state of a task.
- <kdb>Shift</kdb> + <kdb>Delete</kdb>: Deletes a task and focuses the element above of the deleted task.
- <kdb>Alt</kdb> + <kdb>Delete</kdb>: Deletes a task and focuses the element bellow the deleted task.
- <kdb>Ctrl</kdb> + <kdb>Arrow Up</kdb> or <kdb>Ctrl</kdb> + <kdb>Arrow Down</kdb>: Moves a task inside its tasks list.
- <kdb>Insert</kdb>: Will focus the "New task..." entry of the currently opened task section.

##### When the focus is on a task section

- <kdb>Arrow Left</kdb> and <kdb>Arrow Right</kdb>: If the tasks list (sub menu) is closed, these keys will open the sub menu. If the sub menu is open, these keys will move the cursor inside the sub menu label to allow the edition of the section text.
- <kdb>Insert</kdb>: Will focus the "New task..." entry inside the task section. If the task section sub menu isn't open, it will be opened.

##### When the focus is on the "New task..." entry

- <kdb>Ctrl</kdb> + <kdb>Spacebar</kdb>: Toggles the visibility of the tasks list options menu.

***

### Known issues

- **Hovering over items inside the menu doesn't highlight menu items nor sub menus:** This is actually a desired feature. Allowing the items to highlight on mouse hover would cause the entries to loose focus, resulting in the impossibility to keep typing text inside them and constantly forcing us to move the mouse cursor to regain focus.
- **Task entries look wrong:** Task entries on this applet have the ability to wrap its text in case one sets a fixed width for them. They also can be multi line (<kdb>Shift</kdb> + <kdb>Enter</kdb> inside an entry will create a new line). Some Cinnamon themes, like the default Mint-X family of themes, set a fixed width and a fixed height for entries inside menus. These fixed sizes makes it impossible to programmatically set a desired width for the entries (at least, I couldn't find a way to do it). And the fixed height doesn't allow the entries to expand, completely breaking the entries capability to wrap its text and to be multi line.

#### This is how entries should look like
![Correct entries styling](./assets/00-correct-entries-styling.png)

#### This is how entries SHOULD NOT look like
![Incorrect entries styling](./assets/00-incorrect-entries-styling.png)

The only way to fix this (that I could find) is by editing the Cinnamon theme that one is using and remove those fixed sizes. The CSS selectors that needs to be edited are **.menu StEntry**, **.menu StEntry:focus**, **.popup-menu StEntry** and **.popup-menu StEntry:focus**. Depending on the Cinnamon version the theme was created for, one might find just the first two selectors or the last two or all of them. The CSS properties that need to be edited are **width** and **height**. They could be removed, but the sensible thing to do is to rename them to **min-width** and **min-height** respectively. After editing the theme's file and restarting Cinnamon, the entries inside this applet will look and work like they should.

***

### Applets/Desklets/Extensions (a.k.a. xlets) localization

- If this xlet was installed from Cinnamon Settings, all of this xlet's localizations were automatically installed.
- If this xlet was installed manually and not trough Cinnamon Settings, localizations can be installed by executing the script called **localizations.sh** from a terminal opened inside the xlet's folder.
- If this xlet has no locale available for your language, you could create it by following [these instructions](https://github.com/Odyseus/CinnamonTools/wiki/Xlet-localization) and send the .po file to me.
    - If you have a GitHub account:
        - You could send a pull request with the new locale file.
        - If you don't want to clone the repository, just create a [Gist](https://gist.github.com/) and send me the link.
    - If you don't have/want a GitHub account:
        - You can send me a [Pastebin](http://pastebin.com/) (or similar service) to my [Mint Forums account](https://forums.linuxmint.com/memberlist.php?mode=viewprofile&u=164858).
- If the source text (in English) and/or my translation to Spanish has errors/inconsistencies, feel free to report them.
