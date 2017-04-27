## Description

Simple ToDo List is an applet based on two gnome-shell extensions ([Todo list](https://github.com/bsaleil/todolist-gnome-shell-extension) and [Section Todo List](https://github.com/tomMoral/ToDoList)). It allows to create simple ToDo lists from a menu on the panel.

## Applet status

- Its current state is pretty much its final state.
- I have been using this applet for several months now and the last couple of weeks I started *polishing it*.
- For the time being, there isn't any new feature planned for this applet, just bug fixing if any bug is found.
- The applet is ready to be translated, but I would suggest to any willing to translate it to wait until the test face finishes.

## Tested environments

* [x] ![Cinnamon 2.8](https://odyseus.github.io/CinnamonTools/lib/badges/cinn-2.8.svg) ![Linux Mint 17.3](https://odyseus.github.io/CinnamonTools/lib/badges/lm-17.3.svg)
* [x] ![Cinnamon 3.0](https://odyseus.github.io/CinnamonTools/lib/badges/cinn-3.0.svg) ![Linux Mint 18](https://odyseus.github.io/CinnamonTools/lib/badges/lm-18.svg)
* [x] ![Cinnamon 3.2](https://odyseus.github.io/CinnamonTools/lib/badges/cinn-3.2.svg) ![Linux Mint 18.1](https://odyseus.github.io/CinnamonTools/lib/badges/lm-18.1.svg)

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

### Known issues

- **Hovering over items inside the menu doesn't highlight menu items nor sub menus:** This is actually a desired feature. Allowing the items to highlight on mouse hover would cause the entries to loose focus, resulting in the impossibility to keep typing text inside them and constantly forcing us to move the mouse cursor to regain focus.
- **Task entries look wrong:** Task entries on this applet have the ability to wrap its text in case one sets a fixed width for them. They also can be multi line (<kdb>Shift</kdb> + <kdb>Enter</kdb> inside an entry will create a new line). Some Cinnamon themes, like the default Mint-X family of themes, set a fixed width and a fixed height for entries inside menus. These fixed sizes makes it impossible to programmatically set a desired width for the entries (at least, I couldn't find a way to do it). And the fixed height doesn't allow the entries to expand, completely breaking the entries capability to wrap its text and to be multi line. The only way to fix this (that I could find) is by editing the Cinnamon theme that one is using and remove those fixed sizes. The CSS selectors that needs to be edited are **.menu StEntry**, **.menu StEntry:focus**, **.popup-menu StEntry** and **.popup-menu StEntry:focus**. Depending on the Cinnamon version the theme was created for, one might find just the first two selectors or the last two or all of them. The CSS properties that need to be edited are **width** and **height**. They could be removed, but the sensible thing to do is to rename them to **min-width** and **min-height** respectively. After editing the theme's file and restarting Cinnamon, the entries inside this applet will look and work like they should.

## Images

![screenshot](https://cloud.githubusercontent.com/assets/3822556/25260927/90d078ba-2625-11e7-9ed5-6ada5a8fe5ae.png)

## Issue reports

**Issue reporters should adjunct the output of the following commands.**
**Check the content of the log files for sensible information BEFORE running the commands!!!**

`inxi -xxxSc0 -! 31`
`pastebin ~/.cinnamon/glass.log`
`pastebin ~/.xsession-errors`

## [Download Simple ToDo List applet](https://odyseus.github.io/CinnamonTools/pkg/0dyseus@SimpleToDoList.tar.gz)

## References to anyone that could be interested in testing the applet

@buzz @copecu @fortalezense @maladro1t @NikoKrause @Radek71 @sphh @DamienNZ @muzena
