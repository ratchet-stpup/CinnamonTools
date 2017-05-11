## cinnamon_tools_python_modules description

These are modules used by several Python scripts inside this repository. Some are created by me (Odyseus) and some are downloaded. The ones downloaded are *simple* modules that doesn't have dependencies and are added to this modules folder so there is no need to install them on a system to be able to run the scripts.

### help_modules.py

It contains some functions and classes used by the **create_localized_help.py** scripts.

### [pyuca](https://github.com/jtauber/pyuca) module

This module is used to allow the correct ordering of strings with Unicode characters. It is used by the **create_localized_help.py** scripts.

### [mistune](https://github.com/lepture/mistune) module

This module is used to render markdown strings and it's also used by the **create_localized_help.py** scripts.

I modified this module to add support for keyboard keys (`kbd` HTML tags). `[[Key]]` will reder as `<kbd>Key</kbd>`.

The use of this module is to avoid at all cost the use of HTML tags on translatable strings. This will prevent the breakage of the generated HTML pages if an HTML tag is wrongly edited. If a Markdown markup is wrongly edited, the markup characters will not be rendered as HTML, but the HTML page will not break.
