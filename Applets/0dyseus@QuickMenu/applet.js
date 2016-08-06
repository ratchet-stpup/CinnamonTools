/**
 * [Quick Menu Applet]
 * Developed by Odyseus
 * Version: 1.0 (12-09-2016)
 * License: GPLv3
 *
 * Applet based on code found on the following applets:
 *    Custom Applications Menu 2.0 by Nicolas LLOBERA. https://cinnamon-spices.linuxmint.com/applets/view/113
 *    Scripts Menu 0.3 by Pau Capó. https://cinnamon-spices.linuxmint.com/applets/view/185
 */

const Applet = imports.ui.applet;
const Cinnamon = imports.gi.Cinnamon;
const Gettext = imports.gettext;
const _ = Gettext.gettext;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Settings = imports.ui.settings;
const Util = imports.misc.util;
const Tooltips = imports.ui.tooltips;
const Mainloop = imports.mainloop;

const appletUUID = "0dyseus@QuickMenu";
const AppletDirectory = imports.ui.appletManager.appletMeta[appletUUID].path;
var CloseMenuTimeout = null;
var OpenMenuTimeout = null;

// Import the popupMenuExtension.js file inside the applet folder.
imports.searchPath.push(AppletDirectory);
const PopupMenuExtension = imports.popupMenuExtension;

function MyApplet(aOrientation, aPanel_height, aInstance_id) {
	this._init(aOrientation, aPanel_height, aInstance_id);
}

MyApplet.prototype = {
	__proto__: Applet.TextIconApplet.prototype,

	_init: function(aOrientation, aPanel_height, aInstance_id) {
		Applet.TextIconApplet.prototype._init.call(this, aOrientation, aPanel_height, aInstance_id);

		this._orientation = aOrientation;

		this.settings = new Settings.AppletSettings(this, appletUUID, aInstance_id);

		try {
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_ignore_sub_folders",
				"pref_ignore_sub_folders",
				this._updateMenu, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_show_only_desktop_files",
				"pref_show_only_desktop_files",
				this._updateMenu, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_show_submenu_icons",
				"pref_show_submenu_icons",
				this._updateMenu, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_show_applications_icons",
				"pref_show_applications_icons",
				this._updateMenu, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_show_applet_title",
				"pref_show_applet_title",
				this._onSettingsTitle, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_applet_title",
				"pref_applet_title",
				this._onSettingsTitle, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_show_hidden_files",
				"pref_show_hidden_files",
				this._updateMenu, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_show_hidden_folders",
				"pref_show_hidden_folders",
				this._updateMenu, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_autoupdate",
				"pref_autoupdate",
				this._onSettingsAutoupdate, null);
			this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL,
				"pref_directory",
				"pref_directory",
				this._onSettingsDirectory, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_customtooltip",
				"pref_customtooltip",
				this._onSettingsCustomTooltip, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_show_customicon",
				"pref_show_customicon",
				this._onSettingsIcon, null);
			this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL,
				"pref_customicon",
				"pref_customicon",
				this._onSettingsIcon, null);
			this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL,
				"pref_icon_for_menus",
				"pref_icon_for_menus",
				this._updateMenu, null);
			this.settings.bindProperty(Settings.BindingDirection.IN,
				"pref_hotkey",
				"pref_hotkey",
				this._updateKeybinding, null);

			// Resume adding this feature when I figure out how to make it work right.
			// this.settings.bindProperty(Settings.BindingDirection.IN,
			// 	"pref_open_on_hover",
			// 	"pref_open_on_hover",
			// 	null, null);
			// this.settings.bindProperty(Settings.BindingDirection.IN,
			// 	"pref_open_on_hover_delay",
			// 	"pref_open_on_hover_delay",
			// 	null, null);
			// this.settings.bindProperty(Settings.BindingDirection.IN,
			// 	"pref_close_on_leave",
			// 	"pref_close_on_leave",
			// 	null, null);
			// this.settings.bindProperty(Settings.BindingDirection.IN,
			// 	"pref_close_on_leave_delay",
			// 	"pref_close_on_leave_delay",
			// 	null, null);
		} catch (aErr) {
			global.logError(aErr);
		}

		try {
			this.menuManager = new PopupMenu.PopupMenuManager(this);
			this.menu = new Applet.AppletPopupMenu(this, aOrientation, aInstance_id);
			this.menuManager.addMenu(this.menu);

			// Resume adding this feature when I figure out how to make it work right.
			// this.menu.controller = new HoverController(this, this.menu.actor, this.menu);
			// this.controller = new HoverController(this, this.actor, this.menu);

			if (!this.pref_directory)
				this.pref_directory = GLib.get_home_dir() + "/My Quick Launch";

			this.autoupdate_last = this.pref_autoupdate;
			this.directory_last = this.pref_directory;

			this._createContextMenu();
			this._onSettingsCustomTooltip();
			this._onSettingsIcon();
			this._onSettingsTitle();

			if (!this.pref_autoupdate)
				this._createMenu();

		} catch (aErr) {
			global.logError(aErr);
		}
	},

	_updateMenu: function() {
		this.menu.removeAll();
		this._createMenu();
	},

	_createMenu: function() {
		this.menu = this._loadDir(this.pref_directory, this.menu);
	},

	_loadDir: function(aDir, aMenu) {
		if (!aDir || !aMenu)
			return true;
		let self = this;
		let currentDir = Gio.file_new_for_path(aDir);
		if (currentDir.query_exists(null)) {

			let dirs = [];
			let files = [];

			let enumerator = currentDir.enumerate_children("standard::type", Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
			let file;

			// Get all dirs and files
			while ((file = enumerator.next_file(null)) !== null) {
				let fileName = file.get_name();
				let fileType = file.get_file_type();
				if (fileType === Gio.FileType.DIRECTORY) {
					if (this.pref_ignore_sub_folders)
						continue;

					if (/^\./.test(fileName) && !this.pref_show_hidden_folders)
						continue;

					dirs.push(fileName);
				} else {
					if (!/.desktop$/.test(fileName) && this.pref_show_only_desktop_files)
						continue;

					if (/^\./.test(fileName) && !this.pref_show_hidden_files)
						continue;

					let filePath = aDir + "/" + fileName;
					let contentType = Gio.content_type_guess(filePath, null);
					let isDeskFile = contentType.indexOf("application/x-desktop") !== -1;
					let app = Gio.file_new_for_path(filePath);

					if (!app) {
						global.logError("File " + filePath + " not found");
						continue;
					}

					if (isDeskFile)
						app = Gio.DesktopAppInfo.new_from_filename(filePath);

					if (!app)
						continue;

					let iconName;
					if (this.pref_show_applications_icons) {
						let icon = isDeskFile ?
							app.get_icon() :
							Gio.content_type_get_icon(contentType[0]);
						if (icon) {
							if (icon instanceof(Gio.FileIcon))
								iconName = icon.get_file().get_path();
							else
								iconName = icon.get_names()[0].toString();
						} else
							iconName = "image-missing";
					}

					files.push({
						App: app,
						Handler: (isDeskFile ?
							null :
							app.query_default_handler(null)),
						Icon: iconName,
						Name: (isDeskFile ?
							app.get_name() :
							fileName)
					});
				}
			}

			// Populate dirs first
			if (dirs.length > 0 && !this.pref_ignore_sub_folders) {
				dirs = dirs.sort(function(a, b) {
					return a.localeCompare(b);
				});
				let d = 0,
					dLen = dirs.length;
				for (; d < dLen; d++) {
					let directory = currentDir.get_path() + "/" + dirs[d];
					let submenu = this.pref_show_submenu_icons ?
						new PopupMenuExtension.PopupLeftImageSubMenuMenuItem(dirs[d], this.pref_icon_for_menus) :
						new PopupMenu.PopupSubMenuMenuItem(dirs[d]);
					submenu.label.add_style_class_name("quick-menu-directory");
					submenu.menu = this._loadDir(directory, submenu.menu);
					aMenu.addMenuItem(submenu);
				}
			}

			// Populate files
			if (files.length > 0) {
				files = files.sort(function(a, b) {
					return a.Name.localeCompare(b.Name);
				});
				let appInfo = null,
					app = null;
				let f = 0,
					fLen = files.length;
				for (; f < fLen; f++) {
					let item = this.pref_show_applications_icons ?
						new PopupMenuExtension.PopupImageLeftMenuItem(files[f].Name, files[f].Icon) :
						new PopupMenu.PopupMenuItem(files[f].Name);
					item._handler = files[f].Handler;
					item._app = files[f].App;
					item.connect("activate", Lang.bind(this, function() {
						try {
							if (item._handler === null) // It's a -desktop file.
								item._app.launch([], null);
							else
								try { // Try to execute the file.
									GLib.spawn_command_line_async("\"" + item._app.get_path() + "\"");
								} catch (aErr) { // Defaults to launch the file.
									item._handler.launch([item._app], null);
								}
						} catch (aErr) {
							self._notifyme(aErr);
						}
					}));
					aMenu.addMenuItem(item);
				}
			}
		}

		return aMenu;
	},

	_notifyme: function(aMsg) {
		GLib.spawn_command_line_async("notify-send --icon=" + this.pref_customicon + " '" + aMsg + "'");
	},

	_onSettingsAutoupdate: function() {
		if (this.pref_autoupdate !== this.autoupdate_last) {
			this.autoupdate_last = this.pref_autoupdate;
			this._updateMenu();
		}
	},

	_onSettingsDirectory: function() {
		if (this.pref_directory !== this.directory_last) {
			this.directory_last = this.pref_directory;
			this._updateMenu();
		}
	},

	_onSettingsCustomTooltip: function() {
		this.set_applet_tooltip(this.pref_customtooltip);
	},

	_onSettingsIcon: function() {
		if (this.pref_show_customicon) {
			let icon_file = Gio.File.new_for_path(this.pref_customicon);
			if (icon_file.query_exists(null)) {
				this.set_applet_icon_path(this.pref_customicon);
			} else {
				this.set_applet_icon_name(this.pref_customicon);
			}
		} else
			this.hide_applet_icon();
	},

	_onSettingsTitle: function() {
		if (this.pref_show_applet_title)
			this.set_applet_label(this.pref_applet_title);
		else
			this.set_applet_label("");
	},

	_createContextMenu: function() {
		let self = this;
		this.update_menu_item = new PopupMenu.PopupIconMenuItem(_("Update menu"),
			"edit-redo",
			St.IconType.SYMBOLIC);
		this.update_menu_item.connect("activate", Lang.bind(this, this._updateMenu));
		new Tooltips.Tooltip(this.update_menu_item.actor, _("Scan the main folder to find new/deleted files/folders."), this._orientation);
		this._applet_context_menu.addMenuItem(this.update_menu_item);

		this.open_dir_menu_item = new PopupMenu.PopupIconMenuItem(_("Open folder"),
			"folder",
			St.IconType.SYMBOLIC);
		this.open_dir_menu_item.connect("activate", Lang.bind(this, function() {
			Main.Util.spawnCommandLine("xdg-open " + self.pref_directory);
		}));
		new Tooltips.Tooltip(this.open_dir_menu_item.actor, _("Open the main folder."), this._orientation);
		this._applet_context_menu.addMenuItem(this.open_dir_menu_item);

		this.help_menu_item = new PopupMenu.PopupIconMenuItem(_("Help"),
			"dialog-information",
			St.IconType.SYMBOLIC);
		this.help_menu_item.connect("activate", Lang.bind(this, function() {
			Main.Util.spawnCommandLine("xdg-open " + AppletDirectory + "/README.html");
		}));
		new Tooltips.Tooltip(this.help_menu_item.actor, _("Open the help file."), this._orientation);
		this._applet_context_menu.addMenuItem(this.help_menu_item);
	},

	_updateKeybinding: function() {
		Main.keybindingManager.addHotKey("pref_hotkey", this.pref_hotkey, Lang.bind(this, function() {
			if (!Main.overview.visible && !Main.expo.visible)
				this.menu.toggle();
		}));
	},

	on_applet_removed_from_panel: function() {
		this.settings.finalize();
	},

	on_applet_clicked: function(event) {
		if (this.pref_autoupdate && !this.menu.isOpen)
			this._updateMenu();

		this.menu.toggle();
	}
};

// Resume adding this feature when I figure out how to make it work right.
// function HoverController(aApplet, aActor, aMenu) {
// 	this._init(aApplet, aActor, aMenu);
// }

// HoverController.prototype = {
// 	_init: function(aApplet, aActor, aMenu) {
// 		this._applet = aApplet;
// 		this._parentActor = aActor;
// 		this._parentMenu = aMenu;

// 		global.logError(this._parentMenu.paint_id);

// 		if (this._applet.pref_open_on_hover)
// 			this._parentActor.connect("enter-event", Lang.bind(this, this._onEnter));

// 		if (this._applet.pref_close_on_leave)
// 			this._parentActor.connect("leave-event", Lang.bind(this, this._onLeave));

// 		this.shouldOpen = false;
// 	},

// 	_onEnter: function() {
// 		this.shouldOpen = true;

// 		Mainloop.timeout_add(this._applet.pref_open_on_hover_delay, Lang.bind(this, this.open));
// 	},

// 	_onLeave: function() {
// 		this.shouldOpen = this._parentActor === this._applet.actor;
// 		// this.shouldOpen = false;

// 		Mainloop.timeout_add(this._applet.pref_close_on_leave_delay, Lang.bind(this, this.close));
// 	},

// 	open: function() {
// 		if (this.shouldOpen && !this._applet._applet_context_menu.isOpen) {
// 			this._parentMenu.open();
// 		}
// 	},

// 	close: function() {
// 		if (!this.shouldOpen) {
// 			this._parentMenu.close();
// 		}
// 	}
// };

function main(aMetadata, aOrientation, aPanel_height, aInstance_id) {
	let myApplet = new MyApplet(aOrientation, aPanel_height, aInstance_id);
	return myApplet;
}