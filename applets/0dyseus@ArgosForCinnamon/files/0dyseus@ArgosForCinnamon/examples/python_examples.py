#!/usr/bin/python3

print("""
Argos line 1 | iconName=folder dropdown=false
Argos line 2 | iconName=folder iconIsSymbolic=true dropdown=false
---
<b>eval, tooltip and alternate examples</b> | iconName=folder iconSize=24 size=12
--<i><b>Press Alt key to see effect</b></i>
--Default item - eval example | iconName=folder tooltip='Default item tooltip - Press Alt key to display alternate item' eval='imports.ui.main.notify("Default item", "Notification activated by default item.");'
--Alternate item - eval example | iconName=folder iconIsSymbolic=true tooltip='Alternate item tooltip' eval='imports.ui.main.notify("Alternate item", "Notification activated by alternate item.");' alternate=true
--Default PyGObject API Reference - URL example | iconName=folder href='https://lazka.github.io/pgi-docs/'
--Alternate DistroWatch - URL example | iconName=folder iconIsSymbolic=true href='http://distrowatch.com/' alternate=true
--Default Looking Glass log - URI to file example | iconName=folder href='~/.cinnamon/glass.log'
--Alternate xsession-errors log - URI to file example | iconName=folder iconIsSymbolic=true href='~/.xsession-errors' alternate=true
---
<b>Menu and submenu examples</b> | iconName=folder iconSize=24 size=12
--Sub menu level 2
----Sub menu item level 2
----Sub menu level 3
------Sub menu item level 3
------Sub menu level 4
--------Sub menu item level 4
---
<b>Menu items with icons examples</b> | iconName=folder iconSize=24 size=12
--<b><i>A default icon size can be set on the applet settings window</i></b>
--Item with icon 12px symbolic | iconName=folder iconSize=12 iconIsSymbolic=true
--Item with icon 14px | iconName=folder iconSize=14
--Item with icon 16px symbolic | iconName=folder iconSize=16 iconIsSymbolic=true
--Item with icon 18px | iconName=folder iconSize=18
--Item with icon 20px symbolic | iconName=folder iconSize=20 iconIsSymbolic=true
---
<b>ANSI colors, emojis and font size examples</b> | iconName=folder iconSize=24 size=12
--\033[34mANSI \033[32mcolors \033[31mexample \033[35m:smile:\033[0m | ansi=true size=20
--\033[30m:smiley_cat: \033[31m:smile_cat: \033[32m:joy_cat: \033[33m:heart_eyes_cat: \033[34m:smirk_cat: \033[35m:kissing_cat: \033[36m:scream_cat: | ansi=true size=20
--\033[30m:smiley: \033[31m:smile: \033[32m:joy: \033[33m:heart_eyes: \033[34m:smirk: \033[35m:kissing: \033[36m:scream: | ansi=true size=20
---
<b>Pango markup examples</b> | iconName=folder iconSize=24 size=12
--<b>Convenience tags</b> | size=12
--<b>Bold text</b> - <i>Italic text</i> - <s>Strikethrough text</s> - <u>Underline text</u> | size=12
--Subscript text<sub>Subscript text</sub> - Superscript text<sup>Superscript text</sup> | size=12
--<big>Big text</big> - <small>Small text</small> - <tt>Monospace font</tt> | size=12
--<b>&lt;span&gt; attributes</b> | size=12
--<span font_weight='bold' bgcolor='#FF0000' fgcolor='#FFFF00'>Background and foreground colors</span> | size=12
--<span underline='single' underline_color='#FF0000'>Underline</span>        <span underline='double' underline_color='#00FF00'>styles</span>        <span underline='low' underline_color='#FF00FF'>and</span>        <span underline='error' underline_color='#00FFFF'>colors</span> | size=12
""")
