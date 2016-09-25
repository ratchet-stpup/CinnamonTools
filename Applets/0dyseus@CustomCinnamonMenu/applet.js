const Applet = imports.ui.applet;
const Mainloop = imports.mainloop;
const CMenu = imports.gi.CMenu;
const Lang = imports.lang;
const Cinnamon = imports.gi.Cinnamon;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const AppFavorites = imports.ui.appFavorites;
const Gtk = imports.gi.Gtk;
const Atk = imports.gi.Atk;
const Gio = imports.gi.Gio;
const Signals = imports.signals;
const GnomeSession = imports.misc.gnomeSession;
const ScreenSaver = imports.misc.screenSaver;
const FileUtils = imports.misc.fileUtils;
const Util = imports.misc.util;
const Tweener = imports.ui.tweener;
const DND = imports.ui.dnd;
const Meta = imports.gi.Meta;
const DocInfo = imports.misc.docInfo;
const GLib = imports.gi.GLib;
const Settings = imports.ui.settings;
const Pango = imports.gi.Pango;
const SearchProviderManager = imports.ui.searchProviderManager;

const Gettext = imports.gettext;

/**
 * START mark Odyseus
 */
// Needed to get user name
const AccountsService = imports.gi.AccountsService;
// Needed for confirmation dialogs.
const ModalDialog = imports.ui.modalDialog;

var PREF_MAX_FAV_ICON_SIZE = 22;
var PREF_CATEGORY_ICON_SIZE = 22;
var PREF_APPLICATION_ICON_SIZE = 22;
var PREF_CUSTOM_COMMAND_ICON_SIZE = 22;
var PREF_CUSTOM_ICON_FOR_REC_APPS_CAT = "";
var PREF_CUSTOM_LABEL_FOR_REC_APPS_CAT = "";
var PREF_ANIMATE_MENU = false;

// For translation mechanism.
// Incredible that this worked right!! LOL
// Comments that start with // NOTE: are to be extracted by xgettext
// and are directed to translators only.
var UUID;

function _(aStr) {
	// Thanks to https://github.com/lestcape for this!!!
	let customTrans = Gettext.dgettext(UUID, aStr);
	if (customTrans != aStr) {
		return customTrans;
	}
	return Gettext.gettext(aStr);
}
/**
 * END
 */

const INITIAL_BUTTON_LOAD = 30;
const MAX_BUTTON_WIDTH = "max-width: 20em;";

const USER_DESKTOP_PATH = FileUtils.getUserDesktopDir();

const PRIVACY_SCHEMA = "org.cinnamon.desktop.privacy";
const REMEMBER_RECENT_KEY = "remember-recent-files";

let appsys = Cinnamon.AppSystem.get_default();

/* VisibleChildIterator takes a container (boxlayout, etc.)
 * and creates an array of its visible children and their index
 * positions.  We can then work through that list without
 * mucking about with positions and math, just give a
 * child, and it'll give you the next or previous, or first or
 * last child in the list.
 *
 * We could have this object regenerate off a signal
 * every time the visibles have changed in our applicationBox,
 * but we really only need it when we start keyboard
 * navigating, so increase speed, we reload only when we
 * want to use it.
 */

function VisibleChildIterator(container) {
	this._init(container);
}

VisibleChildIterator.prototype = {
	_init: function(container) {
		this.container = container;
		this.reloadVisible();
	},

	reloadVisible: function() {
		this.array = this.container.get_focus_chain()
			.filter(x => !(x._delegate instanceof PopupMenu.PopupSeparatorMenuItem));
	},

	getNextVisible: function(curChild) {
		return this.getVisibleItem(this.array.indexOf(curChild) + 1);
	},

	getPrevVisible: function(curChild) {
		return this.getVisibleItem(this.array.indexOf(curChild) - 1);
	},

	getFirstVisible: function() {
		return this.array[0];
	},

	getLastVisible: function() {
		return this.array[this.array.length - 1];
	},

	getVisibleIndex: function(curChild) {
		return this.array.indexOf(curChild);
	},

	getVisibleItem: function(index) {
		let len = this.array.length;
		index = ((index % len) + len) % len;
		return this.array[index];
	},

	getNumVisibleChildren: function() {
		return this.array.length;
	},

	getAbsoluteIndexOfChild: function(child) {
		return this.container.get_children().indexOf(child);
	}
};

function ApplicationContextMenuItem(appButton, label, action, aIcon) {
	this._init(appButton, label, action, aIcon);
}

ApplicationContextMenuItem.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(appButton, label, action, aIcon) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			focusOnHover: false
		});

		this._appButton = appButton;
		this._action = action;
		this.label = new St.Label({
			text: label
		});

		if (this._appButton.appsMenuButton.pref_show_icons_on_context) {
			this.icon_name = aIcon;
			let icon = new St.Icon({
				icon_name: this.icon_name,
				icon_size: 12,
				icon_type: St.IconType.SYMBOLIC
			});
			this.icon = icon;
			if (this.icon) {
				this.addActor(this.icon);
				this.icon.realize();
			}
		}

		this.addActor(this.label);
	},

	activate: function(event) {
		let pathToDesktopFile = this._appButton.app.get_app_info().get_filename();
		let process;
		let likelyHasSucceeded = false;
		let cmd = "";

		switch (this._action) {
			case "add_to_panel":
				if (!Main.AppletManager.get_role_provider_exists(Main.AppletManager.Roles.PANEL_LAUNCHER)) {
					let new_applet_id = global.settings.get_int("next-applet-id");
					global.settings.set_int("next-applet-id", (new_applet_id + 1));
					let enabled_applets = global.settings.get_strv("enabled-applets");
					enabled_applets.push("panel1:right:0:panel-launchers@cinnamon.org:" + new_applet_id);
					global.settings.set_strv("enabled-applets", enabled_applets);
				}

				let launcherApplet = Main.AppletManager.get_role_provider(Main.AppletManager.Roles.PANEL_LAUNCHER);
				launcherApplet.acceptNewLauncher(this._appButton.app.get_id());

				this._appButton.toggleMenu();
				break;
			case "add_to_desktop":
				let file = Gio.file_new_for_path(this._appButton.app.get_app_info().get_filename());
				let destFile = Gio.file_new_for_path(USER_DESKTOP_PATH + "/" + this._appButton.app.get_id());
				try {
					file.copy(destFile, 0, null, function() {});
					// Need to find a way to do that using the Gio library, but modifying the access::can-execute attribute on the file object seems unsupported
					Util.spawnCommandLine("chmod +x \"" + USER_DESKTOP_PATH + "/" + this._appButton.app.get_id() + "\"");
				} catch (e) {
					global.log(e);
				}
				this._appButton.toggleMenu();
				break;
			case "add_to_favorites":
				AppFavorites.getAppFavorites().addFavorite(this._appButton.app.get_id());
				this._appButton.toggleMenu();
				break;
			case "remove_from_favorites":
				AppFavorites.getAppFavorites().removeFavorite(this._appButton.app.get_id());
				this._appButton.toggleMenu();
				break;
			case "uninstall":
				Util.spawnCommandLine("gksu -m '" +
					// NOTE: This string could be left blank because it's a default string,
					// so it's already translated by Cinnamon. It's up to the translators.
					_("Please provide your password to uninstall this application") +
					"' /usr/bin/cinnamon-remove-application '" +
					this._appButton.app.get_app_info().get_filename() + "'");
				this._appButton.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
				break;
			case "run_with_nvidia_gpu":
				try {
					Util.spawnCommandLine("optirun gtk-launch " + this._appButton.app.get_id());
					likelyHasSucceeded = true;
				} catch (aErr) {
					global.logError(aErr.message);
					likelyHasSucceeded = false;
				} finally {
					if (this._appButton.appsMenuButton.pref_remember_recently_used_apps &&
						this._appButton instanceof ApplicationButton &&
						likelyHasSucceeded) {
						this._appButton.appsMenuButton._storeRecentApp(this._appButton.app.get_id());
					}
					this._appButton.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
				}
				break;
				/**
				 * START mark Odyseus
				 * Custom context menu actions.
				 */
			case "launch_from_terminal":
			case "launch_from_terminal_as_root":
				let elevated = this._action === "launch_from_terminal_as_root" ?
					this._appButton.appsMenuButton.pref_privilege_elevator + " " :
					"";

				/**
				 * Without the run_from_terminal.sh script, I would be forced to use different
				 *  methods to keep the terminal open.
				 * Even so, directly using the gtk-launch command after the -e argument
				 *  works whenever it effing wants!!!
				 * Using the run_from_terminal.sh script, gtk-launch command works 100% of
				 *  the time and, for now, seems to do the trick with all terminals that I tested.
				 * http://askubuntu.com/questions/46627/how-can-i-make-a-script-that-opens-terminal-windows-and-executes-commands-in-the
				 */
				cmd = this._appButton.appsMenuButton.pref_terminal_emulator +
					" -e \"" + this._appButton.appsMenuButton._runFromTerminalScript + " " +
					elevated + "gtk-launch " + this._appButton.app.get_id().replace(/.desktop$/g, "") + "\"";

				try {
					let [success, argv] = GLib.shell_parse_argv(cmd);

					let flags = GLib.SpawnFlags.SEARCH_PATH;
					GLib.spawn_async(null, argv, null, flags, null);
					likelyHasSucceeded = true;
				} catch (aErr) {
					global.logError(aErr.message);
					likelyHasSucceeded = false;
				} finally {
					if (this._appButton.appsMenuButton.pref_remember_recently_used_apps &&
						this._appButton instanceof ApplicationButton &&
						likelyHasSucceeded) {
						this._appButton.appsMenuButton._storeRecentApp(this._appButton.app.get_id());
					}
					this._appButton.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
				}
				break;
			case "open_desktop_file_folder":
				let dirPath;
				try {
					process = new ShellOutputProcess(['dirname', pathToDesktopFile]);
					dirPath = process.spawn_sync_and_get_output();
				} catch (aErr) {
					dirPath = false;
					Main.notify("[Custom Cinnamon Menu]", aErr.message);
					global.logError(aErr.message);
				}

				try {
					Util.spawnCommandLine("xdg-open " + dirPath);
				} catch (aErr) {
					Main.notify("[Custom Cinnamon Menu]", aErr.message);
					global.logError(aErr.message);
				} finally {
					this._appButton.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
				}
				break;
			case "run_as_root":
				try {
					Util.spawnCommandLine(this._appButton.appsMenuButton.pref_privilege_elevator +
						" gtk-launch " + this._appButton.app.get_id());
					likelyHasSucceeded = true;
				} catch (aErr) {
					Main.notify("[Custom Cinnamon Menu]", aErr.message);
					global.logError(aErr.message);
					likelyHasSucceeded = false;
				} finally {
					if (this._appButton.appsMenuButton.pref_remember_recently_used_apps &&
						this._appButton instanceof ApplicationButton &&
						likelyHasSucceeded) {
						this._appButton.appsMenuButton._storeRecentApp(this._appButton.app.get_id());
					}
					this._appButton.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
				}
				break;
			case "open_with_text_editor":
				let currentUser;
				let fileOwner;

				try {
					currentUser = GLib.get_user_name().toString();
					// Get .desktop file owner.
					process = new ShellOutputProcess(['stat', '-c', '"%U"', pathToDesktopFile]);
					fileOwner = process.spawn_sync_and_get_output()
						.replace(/\s+/g, "")
						// If I use the literal double quotes inside the RegEx,
						// cinnamon-json-makepot with the --js argument breaks.
						// SyntaxError: unterminated string literal
						.replace(/\u0022/g, "");
				} catch (aErr) {
					fileOwner = false;
					global.logError(aErr.message);
				}

				if (this._appButton.appsMenuButton.pref_gain_privileges_on_context &&
					currentUser !== fileOwner) {
					cmd += this._appButton.appsMenuButton.pref_privilege_elevator;
				}

				let customEditor = this._appButton.appsMenuButton.pref_custom_editor_for_edit_desktop_file_on_context;
				if (customEditor !== "")
					cmd += " " + customEditor + " " + pathToDesktopFile;
				else
					cmd += " xdg-open " + pathToDesktopFile;

				try {
					Util.spawnCommandLine(cmd);
				} catch (aErr) {
					Main.notify("[Custom Cinnamon Menu]", aErr.message);
					global.logError(aErr.message);
				} finally {
					this._appButton.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
				}
				break;
				/**
				 * END
				 */
		}
		return false;
	}

};

function GenericApplicationButton(appsMenuButton, app) {
	this._init(appsMenuButton, app);
}

GenericApplicationButton.prototype = {
	__proto__: PopupMenu.PopupSubMenuMenuItem.prototype,

	_init: function(appsMenuButton, app, withMenu) {
		this.app = app;
		this.appsMenuButton = appsMenuButton;
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});

		this.withMenu = withMenu;
		if (this.withMenu) {
			this.menu = new PopupMenu.PopupSubMenu(this.actor);
			this.menu.actor.set_style_class_name('menu-context-menu');
			this.menu.connect('open-state-changed', Lang.bind(this, this._subMenuOpenStateChanged));
		}
	},

	highlight: function() {
		if (!this.appsMenuButton.pref_disable_new_apps_highlighting)
			this.actor.add_style_pseudo_class('highlighted');
	},

	unhighlight: function() {
		var app_key = this.app.get_id();
		if (app_key === null) {
			app_key = this.app.get_name() + ":" + this.app.get_description();
		}
		this.appsMenuButton._knownApps.push(app_key);
		this.actor.remove_style_pseudo_class('highlighted');
	},

	_onButtonReleaseEvent: function(actor, event) {
		if (event.get_button() == 1) {
			this.activate(event);
		}
		if (event.get_button() == 3) {
			if (this.withMenu && !this.menu.isOpen)
				this.appsMenuButton.closeContextMenus(this.app, true);
			this.toggleMenu();
		}
		return true;
	},

	activate: function(event) {
		this.unhighlight();
		let likelyHasSucceeded = false;

		let ctrlKey = Clutter.ModifierType.CONTROL_MASK & global.get_pointer()[2];
		let shiftKey = Clutter.ModifierType.SHIFT_MASK & global.get_pointer()[2];
		// let altKey = Clutter.ModifierType.MOD1_MASK & global.get_pointer()[2];
		// global.logError("ctrlKey " + ctrlKey);
		// global.logError("shiftKey " + shiftKey);
		// global.logError("altKey " + altKey);

		if (ctrlKey && this.appsMenuButton._terminalReady) {
			try {
				let elevated = shiftKey ?
					this.appsMenuButton.pref_privilege_elevator + " " :
					"";

				let cmd = this.appsMenuButton.pref_terminal_emulator +
					" -e \"" + this.appsMenuButton._runFromTerminalScript + " " +
					elevated + "gtk-launch " + this.app.get_id().replace(/.desktop$/g, "") + "\"";

				let [success, argv] = GLib.shell_parse_argv(cmd);

				let flags = GLib.SpawnFlags.SEARCH_PATH;
				GLib.spawn_async(null, argv, null, flags, null);
				likelyHasSucceeded = true;
			} catch (aErr) {
				global.logError(aErr.message);
				likelyHasSucceeded = false;
			}
		} else if (shiftKey && !ctrlKey) {
			try {
				Util.spawnCommandLine(this.appsMenuButton.pref_privilege_elevator +
					" gtk-launch " + this.app.get_id());
				likelyHasSucceeded = true;
			} catch (aErr) {
				Main.notify("[Custom Cinnamon Menu]", aErr.message);
				global.logError(aErr.message);
				likelyHasSucceeded = false;
			}
		} else {
			this.app.open_new_window(-1);
			likelyHasSucceeded = true;
		}

		this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
		if (this.appsMenuButton.pref_remember_recently_used_apps &&
			this instanceof ApplicationButton &&
			likelyHasSucceeded) {
			this.appsMenuButton._storeRecentApp(this.app.get_id());
		}
	},

	closeMenu: function() {
		if (this.withMenu)
			this.menu.close(PREF_ANIMATE_MENU);
	},

	toggleMenu: function() {
		if (!this.withMenu)
			return;

		if (!this.menu.isOpen) {
			let children = this.menu.box.get_children();
			for (let i in children) {
				this.menu.box.remove_actor(children[i]);
			}
			let menuItem;
			if (!this.appsMenuButton.pref_hide_add_to_panel_on_context) {
				// NOTE: This string could be left blank because it's a default string,
				// so it's already translated by Cinnamon. It's up to the translators.
				menuItem = new ApplicationContextMenuItem(this, _("Add to panel"),
					"add_to_panel", "list-add");
				this.menu.addMenuItem(menuItem);
			}
			if (USER_DESKTOP_PATH && !this.appsMenuButton.pref_hide_add_to_desktop_on_context) {
				// NOTE: This string could be left blank because it's a default string,
				// so it's already translated by Cinnamon. It's up to the translators.
				menuItem = new ApplicationContextMenuItem(this, _("Add to desktop"),
					"add_to_desktop", "list-add");
				this.menu.addMenuItem(menuItem);
			}
			if (AppFavorites.getAppFavorites().isFavorite(this.app.get_id())) {
				// NOTE: This string could be left blank because it's a default string,
				// so it's already translated by Cinnamon. It's up to the translators.
				menuItem = new ApplicationContextMenuItem(this, _("Remove from favorites"),
					"remove_from_favorites", "edit-delete");
				this.menu.addMenuItem(menuItem);
			} else {
				// NOTE: This string could be left blank because it's a default string,
				// so it's already translated by Cinnamon. It's up to the translators.
				menuItem = new ApplicationContextMenuItem(this, _("Add to favorites"),
					"add_to_favorites", "list-add");
				this.menu.addMenuItem(menuItem);
			}
			if (this.appsMenuButton._canUninstallApps &&
				!this.appsMenuButton.pref_hide_uninstall_on_context) {
				// NOTE: This string could be left blank because it's a default string,
				// so it's already translated by Cinnamon. It's up to the translators.
				menuItem = new ApplicationContextMenuItem(this, _("Uninstall"),
					"uninstall", "edit-delete");
				this.menu.addMenuItem(menuItem);
			}
			if (this.appsMenuButton._isBumblebeeInstalled) {
				// NOTE: This string could be left blank because it's a default string,
				// so it's already translated by Cinnamon. It's up to the translators.
				menuItem = new ApplicationContextMenuItem(this, _("Run with nVidia GPU"),
					"run_with_nvidia_gpu", "nvidia-settings");
				this.menu.addMenuItem(menuItem);
			}
			if (this.appsMenuButton.pref_show_run_as_root_on_context) {
				menuItem = new ApplicationContextMenuItem(this, _("Run as root"),
					"run_as_root", "system-run");
				this.menu.addMenuItem(menuItem);
			}
			if (this.appsMenuButton.pref_show_edit_desktop_file_on_context) {
				menuItem = new ApplicationContextMenuItem(this, _("Edit .desktop file"),
					"open_with_text_editor", "document-open");
				this.menu.addMenuItem(menuItem);
			}
			if (this.appsMenuButton.pref_show_desktop_file_folder_on_context) {
				menuItem = new ApplicationContextMenuItem(this, _("Open .desktop file folder"),
					"open_desktop_file_folder", "folder");
				this.menu.addMenuItem(menuItem);
			}
			if (this.appsMenuButton.pref_show_run_from_terminal_on_context &&
				this.appsMenuButton._terminalReady) {
				menuItem = new ApplicationContextMenuItem(this, _("Run from terminal"),
					"launch_from_terminal", "custom-terminal");
				this.menu.addMenuItem(menuItem);
			}
			if (this.appsMenuButton.pref_show_run_from_terminal_as_root_on_context &&
				this.appsMenuButton._terminalReady) {
				menuItem = new ApplicationContextMenuItem(this, _("Run from terminal as root"),
					"launch_from_terminal_as_root", "custom-terminal");
				this.menu.addMenuItem(menuItem);
			}
		}
		this.menu.toggle(PREF_ANIMATE_MENU);
	},

	_subMenuOpenStateChanged: function() {
		if (this.menu.isOpen)
			this.appsMenuButton._scrollToButton(this.menu);
	}
};

function TransientButton(appsMenuButton, pathOrCommand) {
	this._init(appsMenuButton, pathOrCommand);
}

TransientButton.prototype = {
	__proto__: PopupMenu.PopupSubMenuMenuItem.prototype,

	_init: function(appsMenuButton, pathOrCommand) {
		let displayPath = pathOrCommand;
		if (pathOrCommand.charAt(0) == '~') {
			pathOrCommand = pathOrCommand.slice(1);
			pathOrCommand = GLib.get_home_dir() + pathOrCommand;
		}

		this.isPath = pathOrCommand.substr(pathOrCommand.length - 1) == '/';
		if (this.isPath) {
			this.path = pathOrCommand;
		} else {
			let n = pathOrCommand.lastIndexOf('/');
			if (n != 1) {
				this.path = pathOrCommand.substr(0, n);
			}
		}

		this.pathOrCommand = pathOrCommand;

		this.appsMenuButton = appsMenuButton;
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});

		// We need this fake app to help appEnterEvent/appLeaveEvent
		// work with our search result.
		this.app = {
			get_app_info: {
				get_filename: function() {
					return pathOrCommand;
				}
			},
			get_id: function() {
				return -1;
			},
			get_description: function() {
				return this.pathOrCommand;
			},
			get_name: function() {
				return '';
			}
		};

		let iconBox = new St.Bin();
		this.file = Gio.file_new_for_path(this.pathOrCommand);

		try {
			this.handler = this.file.query_default_handler(null);
			let icon_uri = this.file.get_uri();
			let fileInfo = this.file.query_info(Gio.FILE_ATTRIBUTE_STANDARD_TYPE, Gio.FileQueryInfoFlags.NONE, null);
			let contentType = Gio.content_type_guess(this.pathOrCommand, null);
			let themedIcon = Gio.content_type_get_icon(contentType[0]);
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			this.icon = new St.Icon({
				gicon: themedIcon,
				icon_size: PREF_APPLICATION_ICON_SIZE,
				icon_type: St.IconType.FULLCOLOR
			});
			this.actor.set_style_class_name('menu-application-button');
		} catch (e) {
			this.handler = null;
			let iconName = this.isPath ? 'folder' : 'unknown';
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			this.icon = new St.Icon({
				icon_name: iconName,
				icon_size: PREF_APPLICATION_ICON_SIZE,
				icon_type: St.IconType.FULLCOLOR,
			});
			// @todo Would be nice to indicate we don't have a handler for this file.
			this.actor.set_style_class_name('menu-application-button');
		}

		this.addActor(this.icon);

		this.label = new St.Label({
			text: displayPath,
			style_class: 'menu-application-button-label'
		});
		this.label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
		this.label.set_style(MAX_BUTTON_WIDTH);
		this.addActor(this.label);
		this.isDraggableApp = false;
	},

	_onButtonReleaseEvent: function(actor, event) {
		if (event.get_button() == 1) {
			this.activate(event);
		}
		return true;
	},

	activate: function(event) {
		if (this.handler !== null) {
			this.handler.launch([this.file], null);
		} else {
			// Try anyway, even though we probably shouldn't.
			try {
				Util.spawn(['gvfs-open', this.file.get_uri()]);
			} catch (e) {
				global.logError("No handler available to open " + this.file.get_uri());
			}

		}

		this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
	}
};

function ApplicationButton(appsMenuButton, app, showIcon) {
	this._init(appsMenuButton, app, showIcon);
}

ApplicationButton.prototype = {
	__proto__: GenericApplicationButton.prototype,

	_init: function(appsMenuButton, app, showIcon) {
		GenericApplicationButton.prototype._init.call(this, appsMenuButton, app, true);
		this.category = [];
		this.actor.set_style_class_name('menu-application-button');
		if (showIcon) {
			/**
			 * START mark Odyseus
			 * Just changed the name of the icons size variable.
			 */
			this.icon = this.app.create_icon_texture(PREF_APPLICATION_ICON_SIZE);
			this.addActor(this.icon);
		}
		this.name = this.app.get_name();
		this.label = new St.Label({
			text: this.name,
			style_class: 'menu-application-button-label'
		});
		this.label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
		this.label.set_style(MAX_BUTTON_WIDTH);
		this.addActor(this.label);
		this._draggable = DND.makeDraggable(this.actor);
		this._draggable.connect('drag-end', Lang.bind(this, this._onDragEnd));
		this.isDraggableApp = true;
		this.actor.label_actor = this.label;
		if (showIcon) {
			this.icon.realize();
		}
		this.label.realize();
	},

	get_app_id: function() {
		return this.app.get_id();
	},

	getDragActor: function() {
		let favorites = AppFavorites.getAppFavorites().getFavorites();
		let nbFavorites = favorites.length;
		let monitorHeight = Main.layoutManager.primaryMonitor.height;
		let real_size = (0.7 * monitorHeight) / nbFavorites;
		let icon_size = 0.6 * real_size / global.ui_scale;
		/**
		 * START mark Odyseus
		 * Just changed the name of the icon size variable.
		 */
		if (icon_size > PREF_MAX_FAV_ICON_SIZE)
			icon_size = PREF_MAX_FAV_ICON_SIZE;
		return this.app.create_icon_texture(icon_size);
	},

	// Returns the original actor that should align with the actor
	// we show as the item is being dragged.
	getDragActorSource: function() {
		return this.actor;
	},

	_onDragEnd: function() {
		this.appsMenuButton.favoritesBox._delegate._clearDragPlaceholder();
	}
};

function SearchProviderResultButton(appsMenuButton, provider, result) {
	this._init(appsMenuButton, provider, result);
}

SearchProviderResultButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(appsMenuButton, provider, result) {
		this.provider = provider;
		this.result = result;

		this.appsMenuButton = appsMenuButton;
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});
		this.actor.set_style_class_name('menu-application-button');

		// We need this fake app to help appEnterEvent/appLeaveEvent
		// work with our search result.
		this.app = {
			get_app_info: {
				get_filename: function() {
					return result.id;
				}
			},
			get_id: function() {
				return -1;
			},
			get_description: function() {
				return result.description;
			},
			get_name: function() {
				return result.label;
			}
		};

		this.icon = null;
		if (result.icon) {
			this.icon = result.icon;
		} else if (result.icon_app) {
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			this.icon = result.icon_app.create_icon_texture(PREF_APPLICATION_ICON_SIZE);
		} else if (result.icon_filename) {
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			this.icon = new St.Icon({
				gicon: new Gio.FileIcon({
					file: Gio.file_new_for_path(result.icon_filename)
				}),
				icon_size: PREF_APPLICATION_ICON_SIZE
			});
		}

		if (this.icon) {
			this.addActor(this.icon);
		}
		this.label = new St.Label({
			text: result.label,
			style_class: 'menu-application-button-label'
		});
		this.addActor(this.label);
		this.isDraggableApp = false;
		if (this.icon) {
			this.icon.realize();
		}
		this.label.realize();
	},

	_onButtonReleaseEvent: function(actor, event) {
		if (event.get_button() == 1) {
			this.activate(event);
		}
		return true;
	},

	activate: function(event) {
		try {
			this.provider.on_result_selected(this.result);
			this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
		} catch (e) {
			global.logError(e);
		}
	}
};

function PlaceButton(appsMenuButton, place, button_name, showIcon) {
	this._init(appsMenuButton, place, button_name, showIcon);
}

PlaceButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(appsMenuButton, place, button_name, showIcon) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});
		this.appsMenuButton = appsMenuButton;
		this.place = place;
		this.button_name = button_name;
		this.actor.set_style_class_name('menu-application-button');
		this.actor._delegate = this;
		this.label = new St.Label({
			text: this.button_name,
			style_class: 'menu-application-button-label'
		});
		this.label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
		this.label.set_style(MAX_BUTTON_WIDTH);
		if (showIcon) {
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			this.icon = place.iconFactory(PREF_APPLICATION_ICON_SIZE);
			if (!this.icon)
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
				this.icon = new St.Icon({
				icon_name: "folder",
				icon_size: PREF_APPLICATION_ICON_SIZE,
				icon_type: St.IconType.FULLCOLOR
			});
			if (this.icon)
				this.addActor(this.icon);
		}
		this.addActor(this.label);
		if (showIcon)
			this.icon.realize();
		this.label.realize();
	},

	_onButtonReleaseEvent: function(actor, event) {
		if (event.get_button() == 1) {
			this.place.launch();
			this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
		}
	},

	activate: function(event) {
		this.place.launch();
		this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
	}
};

function RecentContextMenuItem(recentButton, label, is_default, callback) {
	this._init(recentButton, label, is_default, callback);
}

RecentContextMenuItem.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(recentButton, label, is_default, callback) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			focusOnHover: false
		});

		this._recentButton = recentButton;
		this._callback = callback;
		this.label = new St.Label({
			text: label
		});
		this.addActor(this.label);

		if (is_default)
			this.label.style = "font-weight: bold;";
	},

	activate: function(event) {
		this._callback();
		return false;
	}
};

function RecentButton(appsMenuButton, file, showIcon) {
	this._init(appsMenuButton, file, showIcon);
}

RecentButton.prototype = {
	__proto__: PopupMenu.PopupSubMenuMenuItem.prototype,

	_init: function(appsMenuButton, file, showIcon) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});
		this.file = file;
		this.appsMenuButton = appsMenuButton;
		this.button_name = this.file.name;
		this.actor.set_style_class_name('menu-application-button');
		this.actor._delegate = this;
		this.label = new St.Label({
			text: this.button_name,
			style_class: 'menu-application-button-label'
		});
		this.label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
		this.label.set_style(MAX_BUTTON_WIDTH);
		if (showIcon) {
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			this.icon = file.createIcon(PREF_APPLICATION_ICON_SIZE);
			this.addActor(this.icon);
		}
		this.addActor(this.label);
		if (showIcon)
			this.icon.realize();
		this.label.realize();

		this.menu = new PopupMenu.PopupSubMenu(this.actor);
		this.menu.actor.set_style_class_name('menu-context-menu');
		this.menu.connect('open-state-changed', Lang.bind(this, this._subMenuOpenStateChanged));
	},

	_onButtonReleaseEvent: function(actor, event) {
		if (event.get_button() == 1) {
			this.file.launch();
			this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
		}
		if (event.get_button() == 3) {
			if (!this.menu.isOpen)
				this.appsMenuButton.closeContextMenus(this, true);
			this.toggleMenu();
		}
		return true;
	},

	activate: function(event) {
		this.file.launch();
		this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
	},

	closeMenu: function() {
		this.menu.close(PREF_ANIMATE_MENU);
	},

	hasLocalPath: function(file) {
		return file.is_native() || file.get_path() !== null;
	},

	toggleMenu: function() {
		if (!this.menu.isOpen) {
			let children = this.menu.box.get_children();
			for (let i in children) {
				this.menu.box.remove_actor(children[i]);
			}
			let menuItem;

			// NOTE: This string could be left blank because it's a default string,
			// so it's already translated by Cinnamon. It's up to the translators.
			menuItem = new PopupMenu.PopupMenuItem(_("Open with"), {
				reactive: false
			});
			menuItem.actor.style = "font-weight: bold";
			this.menu.addMenuItem(menuItem);

			let file = Gio.File.new_for_uri(this.file.uri);

			let default_info = Gio.AppInfo.get_default_for_type(this.file.mimeType, !this.hasLocalPath(file));

			if (default_info) {
				menuItem = new RecentContextMenuItem(this,
					default_info.get_display_name(),
					false,
					Lang.bind(this, function() {
						default_info.launch([file], null, null);
						this.toggleMenu();
						this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
					}));
				this.menu.addMenuItem(menuItem);
			}

			let infos = Gio.AppInfo.get_all_for_type(this.file.mimeType);

			let i = 0,
				iLen = infos.length;
			for (; i < iLen; i++) {
				let info = infos[i];

				file = Gio.File.new_for_uri(this.file.uri);

				if (!this.hasLocalPath(file) && !info.supports_uris())
					continue;

				if (info.equal(default_info))
					continue;

				menuItem = new RecentContextMenuItem(this,
					info.get_display_name(),
					false,
					Lang.bind(this, function() {
						info.launch([file], null, null);
						this.toggleMenu();
						this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
					}));
				this.menu.addMenuItem(menuItem);
			}

			if (GLib.find_program_in_path("nemo-open-with") !== null) {
				menuItem = new RecentContextMenuItem(this,
					// NOTE: This string could be left blank because it's a default string,
					// so it's already translated by Cinnamon. It's up to the translators.
					_("Other application..."),
					false,
					Lang.bind(this, function() {
						Util.spawnCommandLine("nemo-open-with " + this.file.uri);
						this.toggleMenu();
						this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
					}));
				this.menu.addMenuItem(menuItem);
			}
		}
		this.menu.toggle(PREF_ANIMATE_MENU);
	},

	_subMenuOpenStateChanged: function() {
		if (this.menu.isOpen)
			this.appsMenuButton._scrollToButton(this.menu);
	}
};

function GenericButton(label, icon, reactive, callback) {
	this._init(label, icon, reactive, callback);
}

GenericButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(label, icon, reactive, callback) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});
		this.actor.set_style_class_name('menu-application-button');
		this.actor._delegate = this;
		this.button_name = "";

		this.label = new St.Label({
			text: label,
			style_class: 'menu-application-button-label'
		});
		this.label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
		this.label.set_style(MAX_BUTTON_WIDTH);

		if (icon !== null) {
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			let icon_actor = new St.Icon({
				icon_name: icon,
				icon_type: St.IconType.FULLCOLOR,
				icon_size: PREF_APPLICATION_ICON_SIZE
			});
			this.addActor(icon_actor);
		}

		this.addActor(this.label);
		this.label.realize();

		this.actor.reactive = reactive;
		this.callback = callback;

		this.menu = new PopupMenu.PopupSubMenu(this.actor);
	},

	_onButtonReleaseEvent: function(actor, event) {
		if (event.get_button() == 1) {
			this.callback();
		}
	}
};

function RecentClearButton(appsMenuButton) {
	this._init(appsMenuButton);
}

RecentClearButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(appsMenuButton) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});
		this.appsMenuButton = appsMenuButton;
		this.actor.set_style_class_name('menu-application-button');
		// NOTE: This string could be left blank because it's a default string,
		// so it's already translated by Cinnamon. It's up to the translators.
		this.button_name = _("Clear list");
		this.actor._delegate = this;
		this.label = new St.Label({
			text: this.button_name,
			style_class: 'menu-application-button-label'
		});
		/**
		 * START mark Odyseus
		 * Just changed the name of the icon size variable.
		 */
		this.icon = new St.Icon({
			icon_name: 'edit-clear',
			icon_type: St.IconType.SYMBOLIC,
			icon_size: PREF_APPLICATION_ICON_SIZE
		});
		this.addActor(this.icon);
		this.addActor(this.label);

		this.menu = new PopupMenu.PopupSubMenu(this.actor);
	},

	_onButtonReleaseEvent: function(actor, event) {
		if (event.get_button() == 1) {
			this.appsMenuButton.menu.close(PREF_ANIMATE_MENU);
			let GtkRecent = new Gtk.RecentManager();
			GtkRecent.purge_items();
		}
	}
};

function CategoryButton(app, showIcon) {
	this._init(app, showIcon);
}

CategoryButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(category, showIcon) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});

		this.actor.set_style_class_name('menu-category-button');
		var label;
		let icon = null;
		if (category) {
			if (showIcon) {
				/**
				 * START mark Odyseus
				 */
				if (category.get_menu_id() === "favorites" ||
					category.get_menu_id() === "recentApps") {
					this.icon_name = category.get_icon();
					icon = new St.Icon({
						icon_name: this.icon_name,
						icon_size: PREF_CATEGORY_ICON_SIZE,
						icon_type: St.IconType.FULLCOLOR
					});
				} else {
					/**
					 * END
					 */
					icon = category.get_icon();
					if (icon && icon.get_names)
						this.icon_name = icon.get_names().toString();
					else
						this.icon_name = "";
				}
			} else {
				this.icon_name = "";
			}
			label = category.get_name();
		} else
		// NOTE: This string could be left blank because it's a default string,
		// so it's already translated by Cinnamon. It's up to the translators.
			label = _("All Applications");

		this.actor._delegate = this;
		this.label = new St.Label({
			text: label,
			style_class: 'menu-category-button-label'
		});
		if (category && this.icon_name) {
			/**
			 * START mark Odyseus
			 */
			if (category.get_menu_id() === "favorites" ||
				category.get_menu_id() === "recentApps")
				this.icon = icon;
			else
				this.icon = St.TextureCache.get_default().load_gicon(null, icon, (PREF_CATEGORY_ICON_SIZE));
			/**
			 * END
			 */
			if (this.icon) {
				this.addActor(this.icon);
				this.icon.realize();
			}
		}
		this.actor.accessible_role = Atk.Role.LIST_ITEM;
		this.addActor(this.label);
		this.label.realize();
	}
};

function PlaceCategoryButton(app, showIcon) {
	this._init(app, showIcon);
}

PlaceCategoryButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(category, showIcon) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});
		this.actor.set_style_class_name('menu-category-button');
		this.actor._delegate = this;
		this.label = new St.Label({
			// NOTE: This string could be left blank because it's a default string,
			// so it's already translated by Cinnamon. It's up to the translators.
			text: _("Places"),
			style_class: 'menu-category-button-label'
		});
		if (showIcon) {
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			this.icon = new St.Icon({
				icon_name: "folder",
				icon_size: PREF_CATEGORY_ICON_SIZE,
				icon_type: St.IconType.FULLCOLOR
			});
			this.addActor(this.icon);
			this.icon.realize();
		} else {
			this.icon = null;
		}
		this.addActor(this.label);
		this.label.realize();
	}
};

function RecentCategoryButton(app, showIcon) {
	this._init(app, showIcon);
}

RecentCategoryButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(category, showIcon) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});
		this.actor.set_style_class_name('menu-category-button');
		this.actor._delegate = this;
		this.label = new St.Label({
			// NOTE: This string could be left blank because it's a default string,
			// so it's already translated by Cinnamon. It's up to the translators.
			text: _("Recent Files"),
			style_class: 'menu-category-button-label'
		});
		if (showIcon) {
			/**
			 * START mark Odyseus
			 * Just changed the name of the icon size variable.
			 */
			this.icon = new St.Icon({
				icon_name: "folder-recent",
				icon_size: PREF_CATEGORY_ICON_SIZE,
				icon_type: St.IconType.FULLCOLOR
			});
			this.addActor(this.icon);
			this.icon.realize();
		} else {
			this.icon = null;
		}
		this.addActor(this.label);
		this.label.realize();
	}
};

function FavoritesButton(appsMenuButton, app, nbFavorites) {
	this._init(appsMenuButton, app, nbFavorites);
}

FavoritesButton.prototype = {
	__proto__: GenericApplicationButton.prototype,

	_init: function(appsMenuButton, app, nbFavorites) {
		GenericApplicationButton.prototype._init.call(this, appsMenuButton, app);
		let monitorHeight = Main.layoutManager.primaryMonitor.height;
		let real_size = (0.7 * monitorHeight) / nbFavorites;
		let icon_size = 0.6 * real_size / global.ui_scale;
		/**
		 * START mark Odyseus
		 * Just changed the name of the icon size variable.
		 */
		if (icon_size > PREF_MAX_FAV_ICON_SIZE)
			icon_size = PREF_MAX_FAV_ICON_SIZE;
		this.actor.style = "padding-top: " + (icon_size / 3) + "px;padding-bottom: " + (icon_size / 3) + "px; margin:auto;";

		this.actor.add_style_class_name('menu-favorites-button');
		let icon = app.create_icon_texture(icon_size);

		this.addActor(icon);
		icon.realize();

		this._draggable = DND.makeDraggable(this.actor);
		this._draggable.connect('drag-end', Lang.bind(this, this._onDragEnd));
		this.isDraggableApp = true;
	},

	_onDragEnd: function() {
		this.actor.get_parent()._delegate._clearDragPlaceholder();
	},

	get_app_id: function() {
		return this.app.get_id();
	},

	getDragActor: function() {
		return new Clutter.Clone({
			source: this.actor
		});
	},

	// Returns the original actor that should align with the actor
	// we show as the item is being dragged.
	getDragActorSource: function() {
		return this.actor;
	}
};

function SystemButton(appsMenuButton, icon, nbFavorites, name, desc) {
	this._init(appsMenuButton, icon, nbFavorites, name, desc);
}

SystemButton.prototype = {
	__proto__: PopupMenu.PopupSubMenuMenuItem.prototype,

	_init: function(appsMenuButton, icon, nbFavorites, name, desc) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});

		this.name = name;
		this.desc = desc;

		let monitorHeight = Main.layoutManager.primaryMonitor.height;
		let real_size = (0.7 * monitorHeight) / nbFavorites;
		let icon_size = 0.6 * real_size / global.ui_scale;
		/**
		 * START mark Odyseus
		 * Just changed the name of the icon size variable.
		 */
		if (icon_size > PREF_MAX_FAV_ICON_SIZE)
			icon_size = PREF_MAX_FAV_ICON_SIZE;
		this.actor.style = "padding-top: " + (icon_size / 3) + "px;padding-bottom: " + (icon_size / 3) + "px; margin:auto;";
		this.actor.add_style_class_name('menu-favorites-button');

		let iconObj = new St.Icon({
			icon_name: icon,
			icon_size: icon_size,
			icon_type: St.IconType.FULLCOLOR
		});
		this.addActor(iconObj);
		iconObj.realize();
	},

	_onButtonReleaseEvent: function(actor, event) {
		if (event.get_button() == 1) {
			this.activate();
		}
	}
};

function CategoriesApplicationsBox() {
	this._init();
}

CategoriesApplicationsBox.prototype = {
	_init: function() {
		this.actor = new St.BoxLayout();
		this.actor._delegate = this;
	},

	acceptDrop: function(source, actor, x, y, time) {
		if (source instanceof FavoritesButton) {
			source.actor.destroy();
			actor.destroy();
			AppFavorites.getAppFavorites().removeFavorite(source.app.get_id());
			return true;
		}
		return false;
	}
};

function FavoritesBox() {
	this._init();
}

FavoritesBox.prototype = {
	_init: function() {
		this.actor = new St.BoxLayout({
			vertical: true
		});
		this.actor._delegate = this;

		this._dragPlaceholder = null;
		this._dragPlaceholderPos = -1;
		this._animatingPlaceholdersCount = 0;
	},

	_clearDragPlaceholder: function() {
		if (this._dragPlaceholder) {
			this._dragPlaceholder.animateOutAndDestroy();
			this._dragPlaceholder = null;
			this._dragPlaceholderPos = -1;
		}
	},

	handleDragOver: function(source, actor, x, y, time) {
		let app = source.app;

		let favorites = AppFavorites.getAppFavorites().getFavorites();
		let numFavorites = favorites.length;

		let favPos = favorites.indexOf(app);

		let children = this.actor.get_children();
		let numChildren = children.length;
		let boxHeight = this.actor.height;

		// Keep the placeholder out of the index calculation; assuming that
		// the remove target has the same size as "normal" items, we don't
		// need to do the same adjustment there.
		if (this._dragPlaceholder) {
			boxHeight -= this._dragPlaceholder.actor.height;
			numChildren--;
		}

		let pos = Math.round(y * numChildren / boxHeight);

		if (pos != this._dragPlaceholderPos && pos <= numFavorites) {
			if (this._animatingPlaceholdersCount > 0) {
				let appChildren = children.filter(function(actor) {
					return (actor._delegate instanceof FavoritesButton);
				});
				this._dragPlaceholderPos = children.indexOf(appChildren[pos]);
			} else {
				this._dragPlaceholderPos = pos;
			}

			// Don't allow positioning before or after self
			if (favPos != -1 && (pos == favPos || pos == favPos + 1)) {
				if (this._dragPlaceholder) {
					this._dragPlaceholder.animateOutAndDestroy();
					this._animatingPlaceholdersCount++;
					this._dragPlaceholder.actor.connect('destroy',
						Lang.bind(this, function() {
							this._animatingPlaceholdersCount--;
						}));
				}
				this._dragPlaceholder = null;

				return DND.DragMotionResult.CONTINUE;
			}

			// If the placeholder already exists, we just move
			// it, but if we are adding it, expand its size in
			// an animation
			let fadeIn;
			if (this._dragPlaceholder) {
				this._dragPlaceholder.actor.destroy();
				fadeIn = false;
			} else {
				fadeIn = true;
			}

			this._dragPlaceholder = new DND.GenericDragPlaceholderItem();
			this._dragPlaceholder.child.set_width(source.actor.height);
			this._dragPlaceholder.child.set_height(source.actor.height);
			this.actor.insert_child_at_index(this._dragPlaceholder.actor,
				this._dragPlaceholderPos);
			if (fadeIn)
				this._dragPlaceholder.animateIn();
		}

		return DND.DragMotionResult.MOVE_DROP;
	},

	// Draggable target interface
	acceptDrop: function(source, actor, x, y, time) {
		let app = source.app;

		let id = app.get_id();

		let favorites = AppFavorites.getAppFavorites().getFavoriteMap();

		let srcIsFavorite = (id in favorites);

		let favPos = 0;
		let children = this.actor.get_children();
		let i = 0,
			iLen = this._dragPlaceholderPos;
		for (; i < iLen; i++) {
			if (this._dragPlaceholder &&
				children[i] == this._dragPlaceholder.actor)
				continue;

			if (!(children[i]._delegate instanceof FavoritesButton)) continue;

			let childId = children[i]._delegate.app.get_id();
			if (childId == id)
				continue;
			if (childId in favorites)
				favPos++;
		}

		Meta.later_add(Meta.LaterType.BEFORE_REDRAW, Lang.bind(this,
			function() {
				let appFavorites = AppFavorites.getAppFavorites();
				if (srcIsFavorite)
					appFavorites.moveFavoriteToPos(id, favPos);
				else
					appFavorites.addFavoriteAtPos(id, favPos);
				return false;
			}));

		return true;
	}
};

function MyApplet(metadata, orientation, panel_height, instance_id) {
	this._init(metadata, orientation, panel_height, instance_id);
}

MyApplet.prototype = {
	__proto__: Applet.TextIconApplet.prototype,

	_init: function(metadata, orientation, panel_height, instance_id) {
		Applet.TextIconApplet.prototype._init.call(this, orientation, panel_height, instance_id);
		this.initial_load_done = false;

		this.menuManager = new PopupMenu.PopupMenuManager(this);
		this.menu = new Applet.AppletPopupMenu(this, orientation);
		this.menuManager.addMenu(this.menu);
		this.orientation = orientation;

		this.actor.connect('key-press-event', Lang.bind(this, this._onSourceKeyPress));

		this.settings = new Settings.AppletSettings(this, metadata.uuid, instance_id);

		this._appletEnterEventId = 0;
		this._appletLeaveEventId = 0;
		this._appletHoverDelayId = 0;

		/**
		 * START mark Odyseus
		 * Be careful not to call the _() function before this point!!!
		 */
		// Prepare translation mechanism.
		UUID = metadata.uuid;
		Gettext.bindtextdomain(metadata.uuid, GLib.get_home_dir() + "/.local/share/locale");

		this._applet_dir = imports.ui.appletManager.appletMeta[metadata.uuid].path;
		this._metadata = metadata;
		this._instance_id = instance_id;

		this._bind_settings();
		// From Sane Menu
		Gtk.IconTheme.get_default().append_search_path(metadata.path + "/icons/");
		this._applicationsButtonsBackup = [];
		this._applicationsOrder = {};
		//
		this._expand_applet_context_menu();
		this._hardRefreshTimeout1 = null;
		this._hardRefreshTimeout2 = null;
		this._refreshCustomCommandsTimeout = null;

		PREF_CATEGORY_ICON_SIZE = this.pref_category_icon_size;
		PREF_APPLICATION_ICON_SIZE = this.pref_application_icon_size;
		PREF_MAX_FAV_ICON_SIZE = this.pref_max_fav_icon_size;
		PREF_CUSTOM_COMMAND_ICON_SIZE = this.pref_custom_command_icon_size;
		PREF_CUSTOM_ICON_FOR_REC_APPS_CAT = this.pref_recently_used_apps_custom_icon;
		PREF_ANIMATE_MENU = this.pref_animate_menu;

		this._recentAppsButtons = [];
		this._terminalReady = false;
		this._runFromTerminalScript = this._applet_dir + "/run_from_terminal.sh";

		// NOTE: This string could be left blank because it's a default string,
		// so it's already translated by Cinnamon. It's up to the translators.
		this.set_applet_tooltip(_("Menu"));

		if (GLib.file_test(this._runFromTerminalScript, GLib.FileTest.EXISTS))
			this._terminalReady = true;
		else
			this._terminalReady = false;

		if (this._terminalReady && !GLib.file_test(this._runFromTerminalScript, GLib.FileTest.IS_EXECUTABLE))
			Util.spawnCommandLine("chmod +x \"" + this._runFromTerminalScript);
		/**
		 * END
		 */

		this._updateActivateOnHover();

		this.menu.actor.add_style_class_name('menu-background');
		this.menu.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));

		this._updateKeybinding();

		Main.themeManager.connect("theme-set", Lang.bind(this, this._updateIconAndLabel));
		this._updateIconAndLabel();

		this._searchInactiveIcon = new St.Icon({
			style_class: 'menu-search-entry-icon',
			icon_name: 'edit-find',
			icon_type: St.IconType.SYMBOLIC
		});
		this._searchActiveIcon = new St.Icon({
			style_class: 'menu-search-entry-icon',
			icon_name: 'edit-clear',
			icon_type: St.IconType.SYMBOLIC
		});

		this._searchIconClickedId = 0;
		this._applicationsButtons = [];
		this._applicationsButtonFromApp = {};
		this._favoritesButtons = [];
		this._placesButtons = [];
		this._transientButtons = [];
		this._recentButtons = [];
		this._categoryButtons = [];
		this._searchProviderButtons = [];
		this._selectedItemIndex = null;
		this._previousSelectedActor = null;
		this._previousVisibleIndex = null;
		this._previousTreeSelectedActor = null;
		this._activeContainer = null;
		this._activeActor = null;
		this._applicationsBoxWidth = 0;
		this.menuIsOpening = false;
		this._knownApps = []; // Used to keep track of apps that are already installed, so we can highlight newly installed ones
		this._appsWereRefreshed = false;
		this._canUninstallApps = GLib.file_test("/usr/bin/cinnamon-remove-application", GLib.FileTest.EXISTS);
		this._isBumblebeeInstalled = GLib.file_test("/usr/bin/optirun", GLib.FileTest.EXISTS);
		this.RecentManager = new DocInfo.DocManager();
		this.privacy_settings = new Gio.Settings({
			schema_id: PRIVACY_SCHEMA
		});
		this._display();
		appsys.connect('installed-changed', Lang.bind(this, this.onAppSysChanged));
		AppFavorites.getAppFavorites().connect('changed', Lang.bind(this, this._refreshFavs));
		this._update_hover_delay();
		Main.placesManager.connect('places-updated', Lang.bind(this, this._refreshBelowApps));
		this.RecentManager.connect('changed', Lang.bind(this, this._refreshRecent));
		this.privacy_settings.connect("changed::" + REMEMBER_RECENT_KEY, Lang.bind(this, this._refreshRecent));
		this._fileFolderAccessActive = false;
		this._pathCompleter = new Gio.FilenameCompleter();
		this._pathCompleter.set_dirs_only(false);
		this.lastAcResults = [];
		this.refreshing = false; // used as a flag to know if we're currently refreshing (so we don't do it more than once concurrently)

		// We shouldn't need to call refreshAll() here... since we get a "icon-theme-changed" signal when CSD starts.
		// The reason we do is in case the Cinnamon icon theme is the same as the one specificed in GTK itself (in .config)
		// In that particular case we get no signal at all.
		this._refreshAll();

		St.TextureCache.get_default().connect("icon-theme-changed", Lang.bind(this, this.onIconThemeChanged));
		this._recalc_height();
	},

	/**
	 * START mark Odyseus
	 */
	_bind_settings: function() {
		let bD = Settings.BindingDirection;
		let settingsArray = [
			[bD.BIDIRECTIONAL, "pref_hide_allapps_category", null],
			[bD.BIDIRECTIONAL, "pref_display_favorites_as_category_menu", null],
			[bD.BIDIRECTIONAL, "pref_recently_used_apps", null],
			[bD.IN, "pref_terminal_emulator", null],
			[bD.IN, "pref_show_icons_on_context", null],
			[bD.IN, "pref_hide_add_to_panel_on_context", null],
			[bD.IN, "pref_hide_add_to_desktop_on_context", null],
			[bD.IN, "pref_hide_uninstall_on_context", null],
			[bD.IN, "pref_gain_privileges_on_context", null],
			[bD.IN, "pref_privilege_elevator", null],
			[bD.IN, "pref_custom_editor_for_edit_desktop_file_on_context", null],
			[bD.IN, "pref_show_run_from_terminal_on_context", null],
			[bD.IN, "pref_show_run_from_terminal_as_root_on_context", null],
			[bD.IN, "pref_show_desktop_file_folder_on_context", null],
			[bD.IN, "pref_show_edit_desktop_file_on_context", null],
			[bD.IN, "pref_show_run_as_root_on_context", null],
			[bD.IN, "pref_animate_menu", null],
			[bD.IN, "pref_recently_used_apps_custom_icon", null],
			[bD.IN, "pref_cat_hover_delay", this._update_hover_delay],
			[bD.IN, "pref_remember_recently_used_apps", null],
			[bD.IN, "pref_recently_used_apps_invert_order", null],
			[bD.IN, "pref_recently_used_apps_separator", null],
			[bD.IN, "pref_max_recently_used_apps", null],
			[bD.IN, "pref_apps_info_box_alignment_to_the_left", null],
			[bD.IN, "pref_swap_categories_box", null],
			[bD.IN, "pref_disable_new_apps_highlighting", null],
			[bD.IN, "pref_fuzzy_search_enabled", null],
			[bD.IN, "pref_show_recents_button", null],
			[bD.IN, "pref_system_buttons_display", null],
			[bD.IN, "pref_show_lock_button", null],
			[bD.IN, "pref_show_logout_button", null],
			[bD.IN, "pref_show_shutdown_button", null],
			[bD.IN, "pref_lock_button_custom_icon", null],
			[bD.IN, "pref_logout_button_custom_icon", null],
			[bD.IN, "pref_shutdown_button_custom_icon", null],
			[bD.IN, "pref_separator_heigth", null],
			[bD.IN, "pref_search_box_bottom", null],
			[bD.IN, "pref_custom_width_for_searchbox", null],
			[bD.IN, "pref_show_search_box", null],
			[bD.IN, "pref_show_appinfo_box", null],
			[bD.IN, "pref_max_fav_icon_size", null],
			[bD.IN, "pref_category_icon_size", null],
			[bD.IN, "pref_application_icon_size", null],
			[bD.IN, "pref_max_recent_files", null],
			[bD.IN, "pref_custom_launchers_box_placement", null],
			[bD.IN, "pref_autofit_searchbox_width", null],
			[bD.IN, "pref_custom_command_box_padding_top", null],
			[bD.IN, "pref_custom_command_box_padding_right", null],
			[bD.IN, "pref_custom_command_box_padding_bottom", null],
			[bD.IN, "pref_custom_command_box_padding_left", null],
			[bD.IN, "pref_custom_commands_box_alignment", null],
			[bD.IN, "pref_custom_command_icon_size", null],
			[bD.IN, "pref_categories_box_padding_top", null],
			[bD.IN, "pref_categories_box_padding_right", null],
			[bD.IN, "pref_categories_box_padding_bottom", null],
			[bD.IN, "pref_categories_box_padding_left", null],
			[bD.IN, "pref_hide_applications_list_scrollbar", null],
			[bD.IN, "pref_search_entry_padding_top", null],
			[bD.IN, "pref_search_entry_padding_right", null],
			[bD.IN, "pref_search_entry_padding_bottom", null],
			[bD.IN, "pref_search_entry_padding_left", null],
			[bD.IN, "pref_set_search_entry_padding", null],
			[bD.IN, "pref_set_custom_box_padding", null],
			[bD.IN, "pref_set_categories_padding", null],
			[bD.IN, "pref_search_box_padding_top", null],
			[bD.IN, "pref_search_box_padding_right", null],
			[bD.IN, "pref_search_box_padding_bottom", null],
			[bD.IN, "pref_search_box_padding_left", null],
			[bD.IN, "pref_set_search_box_padding", null],
			[bD.IN, "pref_command_1_label", null],
			[bD.IN, "pref_command_1_command", null],
			[bD.IN, "pref_command_1_icon", null],
			[bD.IN, "pref_command_1_description", null],
			[bD.IN, "pref_command_2_label", null],
			[bD.IN, "pref_command_2_command", null],
			[bD.IN, "pref_command_2_icon", null],
			[bD.IN, "pref_command_2_description", null],
			[bD.IN, "pref_command_3_label", null],
			[bD.IN, "pref_command_3_command", null],
			[bD.IN, "pref_command_3_icon", null],
			[bD.IN, "pref_command_3_description", null],
			[bD.IN, "pref_command_4_label", null],
			[bD.IN, "pref_command_4_command", null],
			[bD.IN, "pref_command_4_icon", null],
			[bD.IN, "pref_command_4_description", null],
			[bD.IN, "pref_command_5_label", null],
			[bD.IN, "pref_command_5_command", null],
			[bD.IN, "pref_command_5_icon", null],
			[bD.IN, "pref_command_5_description", null],
			[bD.IN, "pref_command_6_label", null],
			[bD.IN, "pref_command_6_command", null],
			[bD.IN, "pref_command_6_icon", null],
			[bD.IN, "pref_command_6_description", null],
			[bD.IN, "pref_command_7_label", null],
			[bD.IN, "pref_command_7_command", null],
			[bD.IN, "pref_command_7_icon", null],
			[bD.IN, "pref_command_7_description", null],
			[bD.IN, "pref_command_8_label", null],
			[bD.IN, "pref_command_8_command", null],
			[bD.IN, "pref_command_8_icon", null],
			[bD.IN, "pref_command_8_description", null],
			[bD.IN, "pref_command_9_label", null],
			[bD.IN, "pref_command_9_command", null],
			[bD.IN, "pref_command_9_icon", null],
			[bD.IN, "pref_command_9_description", null],
			[bD.IN, "pref_command_10_label", null],
			[bD.IN, "pref_command_10_command", null],
			[bD.IN, "pref_command_10_icon", null],
			[bD.IN, "pref_command_10_description", null],
			/**
			 * START Original preferences renamed and moved here
			 */
			[bD.IN, "pref_enable_autoscroll", this._update_autoscroll],
			[bD.IN, "pref_search_filesystem", null],
			[bD.IN, "pref_show_places", this._refreshBelowApps],
			[bD.IN, "pref_display_category_icons", this._refreshAll],
			[bD.IN, "pref_display_application_icons", this._refreshAll],
			[bD.IN, "pref_display_fav_box", this._favboxtoggle],
			[bD.IN, "pref_overlay_key", this._updateKeybinding],
			[bD.IN, "pref_custom_label_for_applet", this._updateIconAndLabel],
			[bD.IN, "pref_custom_icon_for_applet", this._updateIconAndLabel],
			[bD.IN, "pref_use_a_custom_icon_for_applet", this._updateIconAndLabel],
			[bD.IN, "pref_open_menu_on_hover", this._updateActivateOnHover],
			[bD.IN, "pref_menu_hover_delay", this._updateActivateOnHover],
			/**
			 * END
			 */
		];
		for (let [binding, property_name, callback] of settingsArray) {
			this.settings.bindProperty(binding, property_name, property_name, callback, null);
		}

		if (!this.pref_hide_allapps_category)
			this.pref_display_favorites_as_category_menu = false;

	},
	/**
	 * END
	 */

	_updateKeybinding: function() {
		Main.keybindingManager.addHotKey("overlay-key", this.pref_overlay_key, Lang.bind(this, function() {
			if (!Main.overview.visible && !Main.expo.visible)
				this.menu.toggle_with_options(PREF_ANIMATE_MENU);
		}));
	},

	onIconThemeChanged: function() {
		if (this.refreshing === false) {
			this.refreshing = true;
			Mainloop.timeout_add_seconds(1, Lang.bind(this, this._refreshAll));
		}
	},

	onAppSysChanged: function() {
		if (this.refreshing === false) {
			this.refreshing = true;
			Mainloop.timeout_add_seconds(1, Lang.bind(this, this._refreshAll));
		}
	},

	_refreshAll: function() {
		/**
		 * START mark Odyseus
		 */
		PREF_CATEGORY_ICON_SIZE = this.pref_category_icon_size;
		PREF_APPLICATION_ICON_SIZE = this.pref_application_icon_size;
		PREF_MAX_FAV_ICON_SIZE = this.pref_max_fav_icon_size;
		PREF_CUSTOM_COMMAND_ICON_SIZE = this.pref_custom_command_icon_size;
		PREF_CUSTOM_ICON_FOR_REC_APPS_CAT = this.pref_recently_used_apps_custom_icon;
		PREF_ANIMATE_MENU = this.pref_animate_menu;

		if (!this.pref_remember_recently_used_apps)
			this.pref_recently_used_apps = []; // Clear list when disabling 
		/**
		 * END
		 */

		try {
			this._refreshApps();
			this._refreshFavs();
			this._refreshPlaces();
			this._refreshRecent();
			this._refreshRecentApps();
		} catch (exception) {
			global.log(exception);
		}
		this.refreshing = false;
	},

	_refreshBelowApps: function() {
		this._refreshPlaces();
		this._refreshRecent();
	},

	openMenu: function() {
		if (!this._applet_context_menu.isOpen) {
			this.menu.open(PREF_ANIMATE_MENU);
		}
	},

	_clearDelayCallbacks: function() {
		if (this._appletHoverDelayId > 0) {
			Mainloop.source_remove(this._appletHoverDelayId);
			this._appletHoverDelayId = 0;
		}
		if (this._appletLeaveEventId > 0) {
			this.actor.disconnect(this._appletLeaveEventId);
			this._appletLeaveEventId = 0;
		}

		return false;
	},

	_updateActivateOnHover: function() {
		if (this._appletEnterEventId > 0) {
			this.actor.disconnect(this._appletEnterEventId);
			this._appletEnterEventId = 0;
		}
		this._clearDelayCallbacks();
		if (this.pref_open_menu_on_hover) {
			this._appletEnterEventId = this.actor.connect('enter-event', Lang.bind(this, function() {
				if (this.pref_menu_hover_delay > 0) {
					this._appletLeaveEventId = this.actor.connect('leave-event', Lang.bind(this, this._clearDelayCallbacks));
					this._appletHoverDelayId = Mainloop.timeout_add(this.pref_menu_hover_delay,
						Lang.bind(this, function() {
							this.openMenu();
							this._clearDelayCallbacks();
						}));
				} else {
					this.openMenu();

				}
			}));
		}
	},

	_update_hover_delay: function() {
		this.cat_hover_delay = this.pref_cat_hover_delay / 1000;
	},

	_recalc_height: function() {
		let scrollBoxHeight = (this.leftBox.get_allocation_box().y2 - this.leftBox.get_allocation_box().y1);
		/**
		 * START mark Odyseus
		 */
		if (this.pref_show_search_box)
			scrollBoxHeight = scrollBoxHeight - (this.searchBox.get_allocation_box().y2 - this.searchBox.get_allocation_box().y1);
		if (this.pref_custom_launchers_box_placement !== 0)
			scrollBoxHeight = scrollBoxHeight - (this.myCustomCommandsBox.get_allocation_box().y2 - this.myCustomCommandsBox.get_allocation_box().y1);
		/**
		 * END
		 */
		this.applicationsScrollBox.style = "height: " + scrollBoxHeight / global.ui_scale + "px;";
	},

	/**
	 * START mark Odyseus
	 */
	_hardRefreshAll: function() {
		if (!this.pref_hide_allapps_category)
			this.pref_display_favorites_as_category_menu = false;

		if (this._hardRefreshTimeout2)
			Mainloop.source_remove(this._hardRefreshTimeout2);

		if (this._hardRefreshTimeout1)
			Mainloop.source_remove(this._hardRefreshTimeout1);

		let self = this;
		this._hardRefreshTimeout1 = Mainloop.timeout_add(500, Lang.bind(this, function() {
			self.on_orientation_changed(this.orientation);
			self._hardRefreshTimeout2 = Mainloop.timeout_add(500, Lang.bind(this, function() {
				self.refreshAll();
				this._hardRefreshTimeout1 = null;
				this._hardRefreshTimeout2 = null;
			}));
		}));
	},
	/**
	 * END
	 */

	on_orientation_changed: function(orientation) {
		this.orientation = orientation;
		this.menu.destroy();
		this.menu = new Applet.AppletPopupMenu(this, orientation);
		this.menuManager.addMenu(this.menu);

		this.menu.actor.add_style_class_name('menu-background');
		this.menu.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));
		this._display();

		if (this.initial_load_done)
			this._refreshAll();
		this._updateIconAndLabel();
	},

	/**
	 * override getDisplayLayout to declare that this applet is suitable for both horizontal and
	 * vertical orientations
	 */
	getDisplayLayout: function() {
		return Applet.DisplayLayout.BOTH;
	},

	on_applet_added_to_panel: function() {
		this.initial_load_done = true;
	},

	_launch_editor: function() {
		Util.spawnCommandLine("cinnamon-menu-editor");
	},

	on_applet_clicked: function(event) {
		this.menu.toggle_with_options(PREF_ANIMATE_MENU);
	},

	_onSourceKeyPress: function(actor, event) {
		let symbol = event.get_key_symbol();

		if (symbol == Clutter.KEY_space || symbol == Clutter.KEY_Return) {
			this.menu.toggle(PREF_ANIMATE_MENU);
			return true;
		} else if (symbol == Clutter.KEY_Escape && this.menu.isOpen) {
			this.menu.close(this.pref_animate_menu);
			return true;
		} else if (symbol == Clutter.KEY_Down) {
			if (!this.menu.isOpen)
				this.menu.toggle(this.pref_animate_menu);
			this.menu.actor.navigate_focus(this.actor, Gtk.DirectionType.DOWN, false);
			return true;
		} else
			return false;
	},

	_onOpenStateChanged: function(menu, open) {
		if (open) {
			// Without the second check, function breaks on Cinnamon stable.
			if (this._appletEnterEventId > 0 && this.actor.handler_block) {
				this.actor.handler_block(this._appletEnterEventId);
			}
			this.menuIsOpening = true;
			this.actor.add_style_pseudo_class('active');
			global.stage.set_key_focus(this.searchEntry);
			this._selectedItemIndex = null;
			this._activeContainer = null;
			this._activeActor = null;

			let n = Math.min(this._applicationsButtons.length,
				INITIAL_BUTTON_LOAD);
			let i = 0;
			for (; i < n; i++) {
				this._applicationsButtons[i].actor.show();
			}
			/**
			 * START mark Odyseus
			 */
			if (this.pref_hide_allapps_category)
				this._clearPrevCatSelection(this._allAppsCategoryButton.actor);
			this._allAppsCategoryButton.actor.style_class = "menu-category-button-selected";
			if (this.pref_hide_allapps_category) {
				this._select_category(this.pref_hide_allapps_category ?
					this._initialSelectedCategory :
					null, this._allAppsCategoryButton);
			} else
				Mainloop.idle_add(Lang.bind(this, this._initial_cat_selection, n));
			/**
			 * END
			 */
		} else {
			// Without the second check, function breaks on Cinnamon stable.
			if (this._appletEnterEventId > 0 && this.actor.handler_unblock) {
				this.actor.handler_unblock(this._appletEnterEventId);
			}
			this.actor.remove_style_pseudo_class('active');
			if (this.searchActive) {
				this.resetSearch();
			}
			this.selectedAppTitle.set_text("");
			this.selectedAppDescription.set_text("");
			this._previousTreeSelectedActor = null;
			this._previousSelectedActor = null;
			this.closeContextMenus(null, false);

			this._clearAllSelections(false);
			this.destroyVectorBox();
		}
	},

	_initial_cat_selection: function(start_index) {
		let n = this._applicationsButtons.length;
		let i = start_index;
		for (; i < n; i++) {
			this._applicationsButtons[i].actor.show();
		}
	},

	destroy: function() {
		this.actor._delegate = null;
		this.menu.destroy();
		this.actor.destroy();
		this.emit('destroy');
	},

	_set_default_menu_icon: function() {
		let path = global.datadir + "/theme/menu.svg";
		if (GLib.file_test(path, GLib.FileTest.EXISTS)) {
			this.set_applet_icon_path(path);
			return;
		}

		path = global.datadir + "/theme/menu-symbolic.svg";
		if (GLib.file_test(path, GLib.FileTest.EXISTS)) {
			this.set_applet_icon_symbolic_path(path);
			return;
		}
		/* If all else fails, this will yield no icon */
		this.set_applet_icon_path("");
	},

	_favboxtoggle: function() {
		if (!this.pref_display_fav_box) {
			this.leftPane.remove_actor(this.leftBox);
		} else {
			this.leftPane.add_actor(this.leftBox, {
				y_align: St.Align.END,
				y_fill: false
			});
		}
	},

	_updateIconAndLabel: function() {
		try {
			if (this.pref_use_a_custom_icon_for_applet) {
				if (this.pref_custom_icon_for_applet === "") {
					this.set_applet_icon_name("");
				} else if (GLib.path_is_absolute(this.pref_custom_icon_for_applet) && GLib.file_test(this.pref_custom_icon_for_applet, GLib.FileTest.EXISTS)) {
					if (this.pref_custom_icon_for_applet.search("-symbolic") != -1)
						this.set_applet_icon_symbolic_path(this.pref_custom_icon_for_applet);
					else
						this.set_applet_icon_path(this.pref_custom_icon_for_applet);
				} else if (Gtk.IconTheme.get_default().has_icon(this.pref_custom_icon_for_applet)) {
					if (this.pref_custom_icon_for_applet.search("-symbolic") != -1)
						this.set_applet_icon_symbolic_name(this.pref_custom_icon_for_applet);
					else
						this.set_applet_icon_name(this.pref_custom_icon_for_applet);
					/**
					 * START mark Odyseus
					 * I added the last condition without checking Gtk.IconTheme.get_default.
					 * Otherwise, if there is a valid icon name added by
					 *  Gtk.IconTheme.get_default().append_search_path, it will not be recognized.
					 * With the following extra condition, the worst that can happen is that
					 *  the applet icon will not change/be set.
					 */
				} else {
					try {
						if (this.pref_custom_icon_for_applet.search("-symbolic") != -1)
							this.set_applet_icon_symbolic_name(this.pref_custom_icon_for_applet);
						else
							this.set_applet_icon_name(this.pref_custom_icon_for_applet);
					} catch (aErr) {
						global.logError(aErr);
					}
				}
			} else {
				this._set_default_menu_icon();
			}
		} catch (e) {
			global.logWarning("Could not load icon file \"" + this.pref_custom_icon_for_applet + "\" for menu button");
		}

		if (this.pref_use_a_custom_icon_for_applet && this.pref_custom_icon_for_applet === "") {
			this._applet_icon_box.hide();
		} else {
			this._applet_icon_box.show();
		}

		if (this.orientation == St.Side.LEFT || this.orientation == St.Side.RIGHT) { // no menu label if in a vertical panel
			this.set_applet_label("");
		} else {
			if (this.pref_custom_label_for_applet !== "")
				this.set_applet_label(this.pref_custom_label_for_applet);
			else
				this.set_applet_label("");
		}
	},

	_onMenuKeyPress: function(actor, event) {
		/**
		 * START mark Odyseus
		 */
		// From Sane Menu
		if (this.pref_fuzzy_search_enabled)
			this._applicationsButtons = Object.create(this._applicationsButtonsBackup);
		/**
		 * END
		 */
		let symbol = event.get_key_symbol();
		let item_actor;
		let index = 0;
		this.appBoxIter.reloadVisible();
		this.catBoxIter.reloadVisible();
		this.favBoxIter.reloadVisible();

		let keyCode = event.get_key_code();
		let modifierState = Cinnamon.get_event_state(event);

		/* check for a keybinding and quit early, otherwise we get a double hit
		   of the keybinding callback */
		let action = global.display.get_keybinding_action(keyCode, modifierState);

		if (action == Meta.KeyBindingAction.CUSTOM) {
			return true;
		}

		index = this._selectedItemIndex;

		if (this._activeContainer === null && symbol == Clutter.KEY_Up) {
			this._activeContainer = this.applicationsBox;
			item_actor = this.appBoxIter.getLastVisible();
			index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
			this._scrollToButton(item_actor._delegate);
		} else if (this._activeContainer === null && symbol == Clutter.KEY_Down) {
			this._activeContainer = this.applicationsBox;
			item_actor = this.appBoxIter.getFirstVisible();
			index = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
			this._scrollToButton(item_actor._delegate);
		} else if (this._activeContainer === null &&
			symbol == (this.pref_swap_categories_box ? Clutter.KEY_Right : Clutter.KEY_Left) &&
			this.pref_display_fav_box) {
			// } else if (this._activeContainer === null && symbol == Clutter.KEY_Left && this.pref_display_fav_box) {
			this._activeContainer = this.favoritesBox;
			item_actor = this.favBoxIter.getFirstVisible();
			index = this.favBoxIter.getAbsoluteIndexOfChild(item_actor);
		} else if (symbol == Clutter.KEY_Up) {
			if (this._activeContainer != this.categoriesBox) {
				this._previousSelectedActor = this._activeContainer.get_child_at_index(index);
				item_actor = this._activeContainer._vis_iter.getPrevVisible(this._previousSelectedActor);
				this._previousVisibleIndex = this._activeContainer._vis_iter.getVisibleIndex(item_actor);
				index = this._activeContainer._vis_iter.getAbsoluteIndexOfChild(item_actor);
				this._scrollToButton(item_actor._delegate);
			} else {
				this._previousTreeSelectedActor = this.categoriesBox.get_child_at_index(index);
				this._previousTreeSelectedActor._delegate.isHovered = false;
				item_actor = this.catBoxIter.getPrevVisible(this._activeActor);
				index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
			}
		} else if (symbol == Clutter.KEY_Down) {
			if (this._activeContainer != this.categoriesBox) {
				this._previousSelectedActor = this._activeContainer.get_child_at_index(index);
				item_actor = this._activeContainer._vis_iter.getNextVisible(this._previousSelectedActor);

				this._previousVisibleIndex = this._activeContainer._vis_iter.getVisibleIndex(item_actor);
				index = this._activeContainer._vis_iter.getAbsoluteIndexOfChild(item_actor);
				this._scrollToButton(item_actor._delegate);
			} else {
				this._previousTreeSelectedActor = this.categoriesBox.get_child_at_index(index);
				this._previousTreeSelectedActor._delegate.isHovered = false;
				item_actor = this.catBoxIter.getNextVisible(this._activeActor);
				index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
				this._previousTreeSelectedActor._delegate.emit('leave-event');
			}
		} else if (symbol == (this.pref_swap_categories_box ? Clutter.KEY_Left : Clutter.KEY_Right) &&
			(this._activeContainer !== this.applicationsBox)) {
			// } else if (symbol == Clutter.KEY_Right && (this._activeContainer !== this.applicationsBox)) {
			if (this._activeContainer == this.categoriesBox) {
				if (this._previousVisibleIndex !== null) {
					item_actor = this.appBoxIter.getVisibleItem(this._previousVisibleIndex);
				} else {
					item_actor = this.appBoxIter.getFirstVisible();
				}
			} else {
				item_actor = (this._previousTreeSelectedActor !== null) ?
					this._previousTreeSelectedActor :
					this.catBoxIter.getFirstVisible();
				index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
				this._previousTreeSelectedActor = item_actor;
			}
			index = item_actor.get_parent()._vis_iter.getAbsoluteIndexOfChild(item_actor);
		} else if (symbol == (this.pref_swap_categories_box ? Clutter.KEY_Right : Clutter.KEY_Left) &&
			this._activeContainer === this.applicationsBox && !this.searchActive) {
			// } else if (symbol == Clutter.KEY_Left && this._activeContainer === this.applicationsBox && !this.searchActive) {
			this._previousSelectedActor = this.applicationsBox.get_child_at_index(index);
			item_actor = (this._previousTreeSelectedActor !== null) ? this._previousTreeSelectedActor : this.catBoxIter.getFirstVisible();
			index = this.catBoxIter.getAbsoluteIndexOfChild(item_actor);
			this._previousTreeSelectedActor = item_actor;
		} else if (symbol == (this.pref_swap_categories_box ? Clutter.KEY_Right : Clutter.KEY_Left) &&
			this._activeContainer === this.categoriesBox && !this.searchActive &&
			this.pref_display_fav_box) {
			// } else if (symbol == Clutter.KEY_Left && this._activeContainer === this.categoriesBox && !this.searchActive && this.pref_display_fav_box) {
			this._previousSelectedActor = this.categoriesBox.get_child_at_index(index);
			item_actor = this.favBoxIter.getFirstVisible();
			index = this.favBoxIter.getAbsoluteIndexOfChild(item_actor);
		} else if (this._activeContainer !== this.categoriesBox && (symbol == Clutter.KEY_Return || symbol == Clutter.KP_Enter)) {
			item_actor = this._activeContainer.get_child_at_index(this._selectedItemIndex);
			item_actor._delegate.activate();
			return true;
		} else if (this.pref_search_filesystem && (this._fileFolderAccessActive || symbol == Clutter.slash)) {
			if (symbol == Clutter.Return || symbol == Clutter.KP_Enter) {
				if (this._run(this.searchEntry.get_text())) {
					this.menu.close(this.pref_animate_menu);
				}
				return true;
			}
			if (symbol == Clutter.Escape) {
				this.searchEntry.set_text('');
				this._fileFolderAccessActive = false;
			}
			if (symbol == Clutter.slash) {
				// Need preload data before get completion. GFilenameCompleter load content of parent directory.
				// Parent directory for /usr/include/ is /usr/. So need to add fake name('a').
				let text = this.searchEntry.get_text().concat('/a');
				let prefix;
				if (text.lastIndexOf(' ') == -1)
					prefix = text;
				else
					prefix = text.substr(text.lastIndexOf(' ') + 1);
				this._getCompletion(prefix);

				return false;
			}
			if (symbol == Clutter.Tab) {
				let text = actor.get_text();
				let prefix;
				if (text.lastIndexOf(' ') == -1)
					prefix = text;
				else
					prefix = text.substr(text.lastIndexOf(' ') + 1);
				let postfix = this._getCompletion(prefix);
				if (postfix !== null && postfix.length > 0) {
					actor.insert_text(postfix, -1);
					actor.set_cursor_position(text.length + postfix.length);
					if (postfix[postfix.length - 1] == '/')
						this._getCompletion(text + postfix + 'a');
				}

				return true;
			}
			return false;

		} else {
			return false;
		}

		this._selectedItemIndex = index;
		if (!item_actor || item_actor === this.searchEntry) {
			return false;
		}
		item_actor._delegate.emit('enter-event');
		return true;
	},

	_addEnterEvent: function(button, callback) {
		let _callback = Lang.bind(this, function() {
			let parent = button.actor.get_parent();
			if (this._activeContainer === this.categoriesBox && parent !== this._activeContainer) {
				this._previousTreeSelectedActor = this._activeActor;
				this._previousSelectedActor = null;
			}
			if (this._previousTreeSelectedActor && this._activeContainer !== this.categoriesBox &&
				parent !== this._activeContainer && button !== this._previousTreeSelectedActor && !this.searchActive) {
				this._previousTreeSelectedActor.style_class = "menu-category-button";
			}
			if (parent != this._activeContainer) {
				parent._vis_iter.reloadVisible();
			}
			let _maybePreviousActor = this._activeActor;
			if (_maybePreviousActor && this._activeContainer !== this.categoriesBox) {
				this._previousSelectedActor = _maybePreviousActor;
				this._clearPrevSelection();
			}
			if (parent === this.categoriesBox && !this.searchActive) {
				this._previousSelectedActor = _maybePreviousActor;
				this._clearPrevCatSelection();
			}
			this._activeContainer = parent;
			this._activeActor = button.actor;
			this._selectedItemIndex = this._activeContainer._vis_iter.getAbsoluteIndexOfChild(this._activeActor);
			callback();
		});
		button.connect('enter-event', _callback);
		button.actor.connect('enter-event', _callback);
	},

	_clearPrevSelection: function(actor) {
		if (this._previousSelectedActor && this._previousSelectedActor != actor) {
			if (this._previousSelectedActor._delegate instanceof ApplicationButton ||
				this._previousSelectedActor._delegate instanceof RecentButton ||
				this._previousSelectedActor._delegate instanceof SearchProviderResultButton ||
				this._previousSelectedActor._delegate instanceof PlaceButton ||
				this._previousSelectedActor._delegate instanceof RecentClearButton)
				this._previousSelectedActor.style_class = "menu-application-button";
			else if (this._previousSelectedActor._delegate instanceof FavoritesButton ||
				this._previousSelectedActor._delegate instanceof SystemButton)
				this._previousSelectedActor.remove_style_pseudo_class("hover");
		}
	},

	_clearPrevCatSelection: function(actor) {
		if (this._previousTreeSelectedActor && this._previousTreeSelectedActor != actor) {
			this._previousTreeSelectedActor.style_class = "menu-category-button";

			if (this._previousTreeSelectedActor._delegate) {
				this._previousTreeSelectedActor._delegate.emit('leave-event');
			}

			if (actor !== undefined) {
				this._previousVisibleIndex = null;
				this._previousTreeSelectedActor = actor;
			}
		} else {
			this.categoriesBox.get_children().forEach(Lang.bind(this, function(child) {
				child.style_class = "menu-category-button";
			}));
		}
	},

	makeVectorBox: function(actor) {
		this.destroyVectorBox(actor);
		let [mx, my, mask] = global.get_pointer();
		let [bx, by] = this.categoriesApplicationsBox.actor.get_transformed_position();
		let [bw, bh] = this.categoriesApplicationsBox.actor.get_transformed_size();
		let [aw, ah] = actor.get_transformed_size();
		let [ax, ay] = actor.get_transformed_position();
		let [appbox_x, appbox_y] = this.applicationsBox.get_transformed_position();

		let right_x = appbox_x - bx;
		let xformed_mouse_x = mx - bx;
		let xformed_mouse_y = my - by;
		let w = Math.max(right_x - xformed_mouse_x, 0);

		let ulc_y = xformed_mouse_y + 0;
		let llc_y = xformed_mouse_y + 0;

		this.vectorBox = new St.Polygon({
			debug: false,
			width: w,
			height: bh,
			ulc_x: 0,
			ulc_y: ulc_y,
			llc_x: 0,
			llc_y: llc_y,
			urc_x: w,
			urc_y: 0,
			lrc_x: w,
			lrc_y: bh
		});

		this.categoriesApplicationsBox.actor.add_actor(this.vectorBox);
		this.vectorBox.set_position(xformed_mouse_x, 0);

		this.vectorBox.show();
		this.vectorBox.set_reactive(true);
		this.vectorBox.raise_top();

		this.vectorBox.connect("leave-event", Lang.bind(this, this.destroyVectorBox));
		this.vectorBox.connect("motion-event", Lang.bind(this, this.maybeUpdateVectorBox));
		this.actor_motion_id = actor.connect("motion-event", Lang.bind(this, this.maybeUpdateVectorBox));
		this.current_motion_actor = actor;
	},

	maybeUpdateVectorBox: function() {
		if (this.vector_update_loop) {
			Mainloop.source_remove(this.vector_update_loop);
			this.vector_update_loop = 0;
		}
		this.vector_update_loop = Mainloop.timeout_add(35, Lang.bind(this, this.updateVectorBox));
	},

	updateVectorBox: function(actor) {
		if (this.vectorBox) {
			let [mx, my, mask] = global.get_pointer();
			let [bx, by] = this.categoriesApplicationsBox.actor.get_transformed_position();
			let xformed_mouse_x = mx - bx;
			let [appbox_x, appbox_y] = this.applicationsBox.get_transformed_position();
			let right_x = appbox_x - bx;
			if ((right_x - xformed_mouse_x) > 0) {
				this.vectorBox.width = Math.max(right_x - xformed_mouse_x, 0);
				this.vectorBox.set_position(xformed_mouse_x, 0);
				this.vectorBox.urc_x = this.vectorBox.width;
				this.vectorBox.lrc_x = this.vectorBox.width;
				this.vectorBox.queue_repaint();
			} else {
				this.destroyVectorBox(actor);
			}
		}
		this.vector_update_loop = 0;
		return false;
	},

	destroyVectorBox: function(actor) {
		if (this.vectorBox !== null) {
			this.vectorBox.destroy();
			this.vectorBox = null;
		}
		if (this.actor_motion_id > 0 && this.current_motion_actor !== null) {
			this.current_motion_actor.disconnect(this.actor_motion_id);
			this.actor_motion_id = 0;
			this.current_motion_actor = null;
		}
	},

	_refreshPlaces: function() {
		let p = 0,
			pLen = this._placesButtons.length;
		for (; p < pLen; p++) {
			this._placesButtons[p].actor.destroy();
		}

		let c = 0,
			cLen = this._categoryButtons.length;
		for (; c < cLen; c++) {
			if (this._categoryButtons[c] instanceof PlaceCategoryButton) {
				this._categoryButtons[c].actor.destroy();
			}
		}
		this._placesButtons = [];

		// Now generate Places category and places buttons and add to the list
		if (this.pref_show_places) {
			this.placesButton = new PlaceCategoryButton(null, this.pref_display_category_icons);
			this._addEnterEvent(this.placesButton, Lang.bind(this, function() {
				if (!this.searchActive) {
					this.placesButton.isHovered = true;
					if (this.cat_hover_delay > 0) {
						Tweener.addTween(this, {
							time: this.cat_hover_delay,
							onComplete: function() {
								if (this.placesButton.isHovered) {
									this._clearPrevCatSelection(this.placesButton);
									this.placesButton.actor.style_class = "menu-category-button-selected";
									this.closeContextMenus(null, false);
									this._displayButtons(null, -1);
								} else {
									this.placesButton.actor.style_class = "menu-category-button";
								}
							}
						});
					} else {
						this._clearPrevCatSelection(this.placesButton);
						this.placesButton.actor.style_class = "menu-category-button-selected";
						this.closeContextMenus(null, false);
						this._displayButtons(null, -1);
					}
					this.makeVectorBox(this.placesButton.actor);
				}
			}));
			this.placesButton.actor.connect('leave-event', Lang.bind(this, function() {
				if (this._previousTreeSelectedActor === null) {
					this._previousTreeSelectedActor = this.placesButton.actor;
				} else {
					let prevIdx = this.catBoxIter.getVisibleIndex(this._previousTreeSelectedActor);
					let nextIdx = this.catBoxIter.getVisibleIndex(this.placesButton.actor);
					let idxDiff = Math.abs(prevIdx - nextIdx);
					if (idxDiff <= 1 || Math.min(prevIdx, nextIdx) < 0) {
						this._previousTreeSelectedActor = this.placesButton.actor;
					}
				}

				this.placesButton.isHovered = false;
			}));
			this._categoryButtons.push(this.placesButton);
			this.categoriesBox.add_actor(this.placesButton.actor);

			let bookmarks = this._listBookmarks();
			let devices = this._listDevices();
			let places = bookmarks.concat(devices);
			let i = 0,
				iLen = places.length;
			for (; i < iLen; i++) {
				let place = places[i];
				let button = new PlaceButton(this, place, place.name, this.pref_display_application_icons);
				this._addEnterEvent(button, Lang.bind(this, function() {
					this._clearPrevSelection(button.actor);
					button.actor.style_class = "menu-application-button-selected";
					this.selectedAppTitle.set_text("");
					this.selectedAppDescription.set_text(button.place.id.slice(16).replace(/%20/g, ' '));
				}));
				button.actor.connect('leave-event', Lang.bind(this, function() {
					this._previousSelectedActor = button.actor;
					this.selectedAppTitle.set_text("");
					this.selectedAppDescription.set_text("");
				}));
				this._placesButtons.push(button);
				this.applicationsBox.add_actor(button.actor);
			}
		}

		this._setCategoriesButtonActive(!this.searchActive);

		this._recalc_height();
		this._resizeApplicationsBox();
	},

	_refreshRecent: function() {
		let r = 0,
			rLen = this._recentButtons.length;
		for (; r < rLen; r++) {
			this._recentButtons[r].actor.destroy();
		}
		let c = 0,
			cLen = this._categoryButtons.length;
		for (; c < cLen; c++) {
			if (this._categoryButtons[c] instanceof RecentCategoryButton) {
				this._categoryButtons[c].actor.destroy();
			}
		}
		this._recentButtons = [];

		// Now generate recent category and recent files buttons and add to the list
		/**
		 * START mark Odyseus
		 * Just added the condition to hide Recent files category.
		 * This is for people that doesn't want to disable the Remember accessed files option
		 * from Privacy but wants to get rid of the Recent files category on the menu.
		 */
		if (this.privacy_settings.get_boolean(REMEMBER_RECENT_KEY) &&
			this.pref_show_recents_button) {
			this.recentButton = new RecentCategoryButton(null, this.pref_display_category_icons);
			this._addEnterEvent(this.recentButton, Lang.bind(this, function() {
				if (!this.searchActive) {
					this.recentButton.isHovered = true;
					if (this.cat_hover_delay > 0) {
						Tweener.addTween(this, {
							time: this.cat_hover_delay,
							onComplete: function() {
								if (this.recentButton.isHovered) {
									this._clearPrevCatSelection(this.recentButton.actor);
									this.recentButton.actor.style_class = "menu-category-button-selected";
									this.closeContextMenus(null, false);
									this._displayButtons(null, null, -1);
								} else {
									this.recentButton.actor.style_class = "menu-category-button";
								}
							}
						});
					} else {
						this._clearPrevCatSelection(this.recentButton.actor);
						this.recentButton.actor.style_class = "menu-category-button-selected";
						this.closeContextMenus(null, false);
						this._displayButtons(null, null, -1);
					}
					this.makeVectorBox(this.recentButton.actor);
				}
			}));
			this.recentButton.actor.connect('leave-event', Lang.bind(this, function() {

				if (this._previousTreeSelectedActor === null) {
					this._previousTreeSelectedActor = this.recentButton.actor;
				} else {
					let prevIdx = this.catBoxIter.getVisibleIndex(this._previousTreeSelectedActor);
					let nextIdx = this.catBoxIter.getVisibleIndex(this.recentButton.actor);

					if (Math.abs(prevIdx - nextIdx) <= 1) {
						this._previousTreeSelectedActor = this.recentButton.actor;
					}
				}

				this.recentButton.isHovered = false;
			}));
			this.categoriesBox.add_actor(this.recentButton.actor);
			this._categoryButtons.push(this.recentButton);

			if (this.RecentManager._infosByTimestamp.length > 0) {
				let id = 0,
					idLen = this.RecentManager._infosByTimestamp.length;
				for (; id < this.pref_max_recent_files && id < idLen; id++) {
					let button = new RecentButton(this, this.RecentManager._infosByTimestamp[id], this.pref_display_application_icons);
					this._addEnterEvent(button, Lang.bind(this, function() {
						this._clearPrevSelection(button.actor);
						button.actor.style_class = "menu-application-button-selected";
						this.selectedAppTitle.set_text("");
						this.selectedAppDescription.set_text(button.file.uri.slice(7).replace(/%20/g, ' '));
					}));
					button.actor.connect('leave-event', Lang.bind(this, function() {
						button.actor.style_class = "menu-application-button";
						this._previousSelectedActor = button.actor;
						this.selectedAppTitle.set_text("");
						this.selectedAppDescription.set_text("");
					}));
					this._recentButtons.push(button);
					this.applicationsBox.add_actor(button.actor);
					this.applicationsBox.add_actor(button.menu.actor);
				}

				let button = new RecentClearButton(this);
				this._addEnterEvent(button, Lang.bind(this, function() {
					this._clearPrevSelection(button.actor);
					button.actor.style_class = "menu-application-button-selected";
				}));
				button.actor.connect('leave-event', Lang.bind(this, function() {
					button.actor.style_class = "menu-application-button";
					this._previousSelectedActor = button.actor;
				}));
				this._recentButtons.push(button);
				this.applicationsBox.add_actor(button.actor);
			} else {
				// NOTE: This string could be left blank because it's a default string,
				// so it's already translated by Cinnamon. It's up to the translators.
				let button = new GenericButton(_("No recent documents"), null, false, null);
				this._recentButtons.push(button);
				this.applicationsBox.add_actor(button.actor);
			}

		}

		this._setCategoriesButtonActive(!this.searchActive);

		this._recalc_height();
		this._resizeApplicationsBox();
	},

	/**
	 * START mark Odyseus
	 */
	_storeRecentApp: function(aAppID) {
		try {
			let t = new Date().getTime();
			let recApps = this.pref_recently_used_apps;
			// Remove object if it was previously launched.
			for (let i = recApps.length; i--;) {
				if (recApps[i]["id"] === aAppID) {
					recApps.splice(i, 1);
				}
			}
			recApps.push({
				id: aAppID,
				lastAccess: t
			});

			// Holy ·$%&/()!!!
			// The only freaking way that I could find to remove duplicated!!!
			// Like always, Stack Overflow is a life saver.
			// http://stackoverflow.com/questions/31014324/remove-duplicated-object-in-array
			let temp = [];

			this.pref_recently_used_apps = recApps.filter(function(aVal) {
				return temp.indexOf(aVal.id) === -1 ? temp.push(aVal.id) : false;
			});

			this._refreshRecentApps();
		} catch (aErr) {
			global.logError(aErr);
		}
	},

	_refreshRecentApps: function() {
		let r = 0,
			rLen = this._recentAppsButtons.length;
		for (; r < rLen; r++) {
			this._recentAppsButtons[r].actor.destroy();
		}
		if (!this.pref_remember_recently_used_apps) {
			let c = 0,
				cLen = this._categoryButtons.length;
			for (; c < cLen; c++) {
				if (this._categoryButtons[c] instanceof RecentAppsCategoryButton) {
					this._categoryButtons[c].actor.destroy();
				}
			}
			return true;
		}
		this._recentAppsButtons = [];
		this._recentAppsApps = [];

		if (this.pref_recently_used_apps.length > 0 && this.recentAppsButton !== null) {
			let self = this;
			Array.prototype.slice.call(this._applicationsButtons).forEach(function(aBtn) {
				let appId = aBtn.get_app_id();
				let c = 0,
					cLen = self.pref_recently_used_apps.length;
				for (; c < cLen; c++) {
					if (self.pref_recently_used_apps[c]["id"] === appId) {
						aBtn.app.lastAccess = self.pref_recently_used_apps[c]["lastAccess"];
						self._recentAppsApps.push(aBtn.app);
						continue;
					}
				}
			});

			let clearBtn = new GenericButton(_("Clear list"), "edit-clear", true, Lang.bind(this, function() {
				this.pref_recently_used_apps = [];
				this._refreshRecentApps();
			}));
			this._addEnterEvent(clearBtn, Lang.bind(this, function() {
				this._clearPrevSelection(clearBtn.actor);
				clearBtn.actor.style_class = "menu-application-button-selected";
			}));
			clearBtn.actor.connect('leave-event', Lang.bind(this, function() {
				clearBtn.actor.style_class = "menu-application-button";
				this._previousSelectedActor = clearBtn.actor;
			}));

			if (this.pref_recently_used_apps_invert_order) {
				this._recentAppsButtons.push(clearBtn);
				this.applicationsBox.add_actor(clearBtn.actor);
			}

			this._recentAppsApps = this._recentAppsApps.sort(function(a, b) {
				if (self.pref_recently_used_apps_invert_order)
					return a["lastAccess"] > b["lastAccess"];
				return a["lastAccess"] < b["lastAccess"];
			});

			let id = 0,
				idLen = this._recentAppsApps.length;
			for (; id < this.pref_max_recently_used_apps && id < idLen; id++) {
				let button = new ApplicationButton(this, this._recentAppsApps[id], this.pref_display_application_icons);
				button.actor.connect('leave-event', Lang.bind(this, this._appLeaveEvent, button));
				this._addEnterEvent(button, Lang.bind(this, this._appEnterEvent, button));
				this._recentAppsButtons.push(button);
				this.applicationsBox.add_actor(button.actor);
				this.applicationsBox.add_actor(button.menu.actor);
			}

			if (!this.pref_recently_used_apps_invert_order) {
				this._recentAppsButtons.push(clearBtn);
				this.applicationsBox.add_actor(clearBtn.actor);
			}
		} else {
			let button = new GenericButton(_("No recent applications"), null, false, null);
			this._recentAppsButtons.push(button);
			this.applicationsBox.add_actor(button.actor);
		}

		this._setCategoriesButtonActive(!this.searchActive);

		this._recalc_height();
		this._resizeApplicationsBox();
	},
	/**
	 * END
	 */

	_refreshApps: function() {
		this.applicationsBox.destroy_all_children();
		this._applicationsButtons = [];
		this._transientButtons = [];
		this._applicationsButtonFromApp = {};
		this._applicationsBoxWidth = 0;
		//Remove all categories
		this.categoriesBox.destroy_all_children();

		if (!this.pref_hide_allapps_category && !this.pref_display_favorites_as_category_menu) {
			this._allAppsCategoryButton = new CategoryButton(null);
			this._addEnterEvent(this._allAppsCategoryButton, Lang.bind(this, function() {
				if (!this.searchActive) {
					this._allAppsCategoryButton.isHovered = true;
					if (this.cat_hover_delay > 0) {
						Tweener.addTween(this, {
							time: this.cat_hover_delay,
							onComplete: function() {
								if (this._allAppsCategoryButton.isHovered) {
									this._clearPrevCatSelection(this._allAppsCategoryButton.actor);
									this._allAppsCategoryButton.actor.style_class = "menu-category-button-selected";
									this._select_category(null, this._allAppsCategoryButton);
								} else {
									this._allAppsCategoryButton.actor.style_class = "menu-category-button";
								}
							}
						});
					} else {
						this._clearPrevCatSelection(this._allAppsCategoryButton.actor);
						this._allAppsCategoryButton.actor.style_class = "menu-category-button-selected";
						this._select_category(null, this._allAppsCategoryButton);
					}
					this.makeVectorBox(this._allAppsCategoryButton.actor);
				}
			}));
			this._allAppsCategoryButton.actor.connect('leave-event', Lang.bind(this, function() {
				this._previousSelectedActor = this._allAppsCategoryButton.actor;
				this._allAppsCategoryButton.isHovered = false;
			}));
			this.categoriesBox.add_actor(this._allAppsCategoryButton.actor);
		}

		/**
		 * START mark Odyseus
		 * Favorites category
		 */
		try {
			if (this.pref_hide_allapps_category && this.pref_display_favorites_as_category_menu) {
				let favCat = {
					get_menu_id: function() {
						return "favorites";
					},
					get_id: function() {
						return -1;
					},
					get_description: function() {
						return this.get_name();
					},
					get_name: function() {
						return _("Favorites");
					},
					get_is_nodisplay: function() {
						return false;
					},
					get_icon: function() {
						return "user-bookmarks";
					}
				};
				this._initialSelectedCategory = "favorites";
				this._allAppsCategoryButton = new CategoryButton(favCat, this.pref_display_category_icons);
				this._addEnterEvent(this._allAppsCategoryButton, Lang.bind(this, function() {
					if (!this.searchActive) {
						this._allAppsCategoryButton.isHovered = true;
						if (this.cat_hover_delay > 0) {
							Tweener.addTween(this, {
								time: this.cat_hover_delay,
								onComplete: function() {
									if (this._allAppsCategoryButton.isHovered) {
										this._clearPrevCatSelection(this._allAppsCategoryButton.actor);
										this._allAppsCategoryButton.actor.style_class = "menu-category-button-selected";
										this._select_category(this._initialSelectedCategory, this._allAppsCategoryButton);
									} else {
										this._allAppsCategoryButton.actor.style_class = "menu-category-button";
									}
								}
							});
						} else {
							this._clearPrevCatSelection(this._allAppsCategoryButton.actor);
							this._allAppsCategoryButton.actor.style_class = "menu-category-button-selected";
							this._select_category(this._initialSelectedCategory, this._allAppsCategoryButton);
						}
						this.makeVectorBox(this._allAppsCategoryButton.actor);
					}
				}));
				this._allAppsCategoryButton.actor.connect('leave-event', Lang.bind(this, function() {
					this._previousSelectedActor = this._allAppsCategoryButton.actor;
					this._allAppsCategoryButton.isHovered = false;
				}));
				this.categoriesBox.add_actor(this._allAppsCategoryButton.actor);
			}
		} catch (aErr) {
			global.logError(aErr);
		}
		/**
		 * END
		 */

		/**
		 * START mark Odyseus
		 * Recent apps category.
		 * This was easy...until I started to try to sort the apps by execution time!!
		 * It was a total nightmare!!!!
		 */
		try {
			if (this.pref_remember_recently_used_apps) {
				this.recentAppsCatButton = new RecentAppsCategoryButton(null, this.pref_display_category_icons);
				this._addEnterEvent(this.recentAppsCatButton, Lang.bind(this, function() {
					if (!this.searchActive) {
						this.recentAppsCatButton.isHovered = true;
						if (this.cat_hover_delay > 0) {
							Tweener.addTween(this, {
								time: this.cat_hover_delay,
								onComplete: function() {
									if (this.recentAppsCatButton.isHovered) {
										this._clearPrevCatSelection(this.recentAppsCatButton.actor);
										this.recentAppsCatButton.actor.style_class = "menu-category-button-selected";
										this.closeContextMenus(null, false);
										this._select_category("recentApps", null, null, null, null, true);
									} else {
										this.recentAppsCatButton.actor.style_class = "menu-category-button";
									}
								}
							});
						} else {
							this._clearPrevCatSelection(this.recentAppsCatButton.actor);
							this.recentAppsCatButton.actor.style_class = "menu-category-button-selected";
							this.closeContextMenus(null, false);
							this._select_category("recentApps", null, null, null, null, true);
						}
						this.makeVectorBox(this.recentAppsCatButton.actor);
					}
				}));
				this.recentAppsCatButton.actor.connect('leave-event', Lang.bind(this, function() {
					this._previousSelectedActor = this.recentAppsCatButton.actor;
					this.recentAppsCatButton.isHovered = false;
				}));
				this.categoriesBox.add_actor(this.recentAppsCatButton.actor);
				this._categoryButtons.push(this.recentAppsCatButton);

				if (this.pref_recently_used_apps_separator) {
					let separatorBox = new SeparatorBox(true, -1, true);
					this.categoriesBox.add_actor(separatorBox.actor);
				}
			}
		} catch (aErr) {
			global.logError(aErr);
		}
		/**
		 * END
		 */

		let trees = [appsys.get_tree()];

		for (let t in trees) {
			let tree = trees[t];
			let root = tree.get_root_directory();
			let dirs = [];
			let iter = root.iter();
			let nextType;

			while ((nextType = iter.next()) != CMenu.TreeItemType.INVALID) {
				if (nextType == CMenu.TreeItemType.DIRECTORY) {
					dirs.push(iter.get_directory());
				}
			}

			let prefCats = ["administration", "preferences"];

			dirs = dirs.sort(function(a, b) {
				let menuIdA = a.get_menu_id().toLowerCase();
				let menuIdB = b.get_menu_id().toLowerCase();

				let prefIdA = prefCats.indexOf(menuIdA);
				let prefIdB = prefCats.indexOf(menuIdB);

				if (prefIdA < 0 && prefIdB >= 0) {
					return -1;
				}
				if (prefIdA >= 0 && prefIdB < 0) {
					return 1;
				}

				let nameA = a.get_name().toLowerCase();
				let nameB = b.get_name().toLowerCase();

				if (nameA > nameB) {
					return 1;
				}
				if (nameA < nameB) {
					return -1;
				}
				return 0;
			});

			let i = 0,
				iLen = dirs.length;
			for (; i < iLen; i++) {
				let dir = dirs[i];
				if (dir.get_is_nodisplay())
					continue;
				if (this._loadCategory(dir)) {
					let categoryButton = new CategoryButton(dir, this.pref_display_category_icons);
					this._addEnterEvent(categoryButton, Lang.bind(this, function() {
						if (!this.searchActive) {
							categoryButton.isHovered = true;
							if (this.cat_hover_delay > 0) {
								Tweener.addTween(this, {
									time: this.cat_hover_delay,
									onComplete: function() {
										if (categoryButton.isHovered) {
											this._clearPrevCatSelection(categoryButton.actor);
											categoryButton.actor.style_class = "menu-category-button-selected";
											this._select_category(dir, categoryButton);
										} else {
											categoryButton.actor.style_class = "menu-category-button";

										}
									}
								});
							} else {
								this._clearPrevCatSelection(categoryButton.actor);
								categoryButton.actor.style_class = "menu-category-button-selected";
								this._select_category(dir, categoryButton);
							}
							this.makeVectorBox(categoryButton.actor);
						}
					}));
					categoryButton.actor.connect('leave-event', Lang.bind(this, function() {
						if (this._previousTreeSelectedActor === null) {
							this._previousTreeSelectedActor = categoryButton.actor;
						} else {
							let prevIdx = this.catBoxIter.getVisibleIndex(this._previousTreeSelectedActor);
							let nextIdx = this.catBoxIter.getVisibleIndex(categoryButton.actor);
							if (Math.abs(prevIdx - nextIdx) <= 1) {
								this._previousTreeSelectedActor = categoryButton.actor;
							}
						}
						categoryButton.isHovered = false;
					}));
					if (i === 0 && this.pref_hide_allapps_category &&
						!this.pref_display_favorites_as_category_menu) {
						this._initialSelectedCategory = dir;
						this._allAppsCategoryButton = categoryButton;
					}
					this.categoriesBox.add_actor(categoryButton.actor);
				}
			}
		}
		// Sort apps and add to applicationsBox
		this._applicationsButtons.sort(function(a, b) {
			a = Util.latinise(a.app.get_name().toLowerCase());
			b = Util.latinise(b.app.get_name().toLowerCase());
			return a > b;
		});

		let i = 0,
			iLen = this._applicationsButtons.length;
		for (; i < iLen; i++) {
			this.applicationsBox.add_actor(this._applicationsButtons[i].actor);
			this.applicationsBox.add_actor(this._applicationsButtons[i].menu.actor);
		}

		/**
		 * START mark Odyseus
		 */
		// From Sane Menu
		if (this.pref_fuzzy_search_enabled)
			this._applicationsButtonsBackup = Object.create(this._applicationsButtons);
		//
		if (this.pref_autofit_searchbox_width && (this.pref_custom_launchers_box_placement >= 3 ||
				this.pref_custom_launchers_box_placement === 0)) {
			let searchEntryWidth = (this.applicationsBox.get_allocation_box().x2 -
				this.applicationsBox.get_allocation_box().x1);
			searchEntryWidth = searchEntryWidth + (this.categoriesBox.get_allocation_box().x2 -
				this.categoriesBox.get_allocation_box().x1);
			this.searchEntry.set_width(searchEntryWidth);
		}
		/**
		 * END
		 */

		this._appsWereRefreshed = true;
	},

	_favEnterEvent: function(button) {
		button.actor.add_style_pseudo_class("hover");
		if (button instanceof FavoritesButton) {
			this.selectedAppTitle.set_text(button.app.get_name());
			if (button.app.get_description())
				this.selectedAppDescription.set_text(button.app.get_description().split("\n")[0]);
			else
				this.selectedAppDescription.set_text("");
		} else {
			this.selectedAppTitle.set_text(button.name);
			this.selectedAppDescription.set_text(button.desc);
		}
	},

	_favLeaveEvent: function(widget, event, button) {
		this._previousSelectedActor = button.actor;
		button.actor.remove_style_pseudo_class("hover");
		this.selectedAppTitle.set_text("");
		this.selectedAppDescription.set_text("");
	},

	_refreshFavs: function() {
		//Remove all favorites
		this.favoritesBox.destroy_all_children();

		//Load favorites again
		this._favoritesButtons = [];
		let launchers = global.settings.get_strv('favorite-apps');
		let appSys = Cinnamon.AppSystem.get_default();
		let j = 0;
		let i = 0,
			iLen = launchers.length;
		for (; i < iLen; ++i) {
			let app = appSys.lookup_app(launchers[i]);
			if (app) {
				let button = new FavoritesButton(this, app, launchers.length + 3); // + 3 because we're adding 3 system buttons at the bottom
				this._favoritesButtons[app] = button;
				this.favoritesBox.add_actor(button.actor, {
					y_align: St.Align.END,
					y_fill: false
				});

				this._addEnterEvent(button, Lang.bind(this, this._favEnterEvent, button));
				button.actor.connect('leave-event', Lang.bind(this, this._favLeaveEvent, button));

				++j;
			}
		}

		//Separator
		if (launchers.length !== 0) {
			/**
			 * START mark Odyseus
			 */
			let separatorBox = new SeparatorBox(false, this.pref_separator_heigth, true);
			this.favoritesBox.add_actor(separatorBox.actor);
			/**
			 * END
			 */

			// Original code
			// let separator = new PopupMenu.PopupSeparatorMenuItem();
			// this.favoritesBox.add_actor(separator.actor, {
			// 	y_align: St.Align.END,
			// 	y_fill: true
			// });
		}

		if (this.pref_system_buttons_display === 1) {
			if (this.pref_show_lock_button) { // Lock screen
				let button1 = new SystemButton(this, "system-lock-screen", launchers.length + 3,
					// NOTE: This string could be left blank because it's a default string,
					// so it's already translated by Cinnamon. It's up to the translators.
					_("Lock screen"),
					// NOTE: This string could be left blank because it's a default string,
					// so it's already translated by Cinnamon. It's up to the translators.
					_("Lock the screen"));

				this._addEnterEvent(button1, Lang.bind(this, this._favEnterEvent, button1));
				button1.actor.connect('leave-event', Lang.bind(this, this._favLeaveEvent, button1));

				button1.activate = Lang.bind(this, function() {
					this.menu.close(this.pref_animate_menu);

					let screensaver_settings = new Gio.Settings({
						schema_id: "org.cinnamon.desktop.screensaver"
					});
					let screensaver_dialog = Gio.file_new_for_path("/usr/bin/cinnamon-screensaver-command");
					if (screensaver_dialog.query_exists(null)) {
						if (screensaver_settings.get_boolean("ask-for-away-message")) {
							Util.spawnCommandLine("cinnamon-screensaver-lock-dialog");
						} else {
							Util.spawnCommandLine("cinnamon-screensaver-command --lock");
						}
					} else {
						this._screenSaverProxy.LockRemote("");
					}
				});

				this.favoritesBox.add_actor(button1.actor, {
					y_align: St.Align.END,
					y_fill: false
				});
			}

			if (this.pref_show_logout_button) { // Logout button
				let button2 = new SystemButton(this, "system-log-out", launchers.length + 3,
					// NOTE: This string could be left blank because it's a default string,
					// so it's already translated by Cinnamon. It's up to the translators.
					_("Logout"),
					// NOTE: This string could be left blank because it's a default string,
					// so it's already translated by Cinnamon. It's up to the translators.
					_("Leave the session"));

				this._addEnterEvent(button2, Lang.bind(this, this._favEnterEvent, button2));
				button2.actor.connect('leave-event', Lang.bind(this, this._favLeaveEvent, button2));

				button2.activate = Lang.bind(this, function() {
					this.menu.close(this.pref_animate_menu);
					this._session.LogoutRemote(0);
				});

				this.favoritesBox.add_actor(button2.actor, {
					y_align: St.Align.END,
					y_fill: false
				});
			}

			if (this.pref_show_shutdown_button) { // Shutdown button
				let button3 = new SystemButton(this, "system-shutdown", launchers.length + 3,
					// NOTE: This string could be left blank because it's a default string,
					// so it's already translated by Cinnamon. It's up to the translators.
					_("Quit"),
					// NOTE: This string could be left blank because it's a default string,
					// so it's already translated by Cinnamon. It's up to the translators.
					_("Shutdown the computer"));

				this._addEnterEvent(button3, Lang.bind(this, this._favEnterEvent, button3));
				button3.actor.connect('leave-event', Lang.bind(this, this._favLeaveEvent, button3));

				button3.activate = Lang.bind(this, function() {
					this.menu.close(this.pref_animate_menu);
					this._session.ShutdownRemote();
				});

				this.favoritesBox.add_actor(button3.actor, {
					y_align: St.Align.END,
					y_fill: false
				});
			}
		}

		this._recalc_height();
	},

	_loadCategory: function(dir, top_dir) {
		var iter = dir.iter();
		var has_entries = false;
		var nextType;
		if (!top_dir)
			top_dir = dir;
		while ((nextType = iter.next()) != CMenu.TreeItemType.INVALID) {
			if (nextType == CMenu.TreeItemType.ENTRY) {
				var entry = iter.get_entry();
				if (!entry.get_app_info().get_nodisplay()) {
					has_entries = true;

					var app = appsys.lookup_app_by_tree_entry(entry);
					if (!app)
						app = appsys.lookup_settings_app_by_tree_entry(entry);
					var app_key = app.get_id();

					if (app_key === null) {
						app_key = app.get_name() + ":" +
							app.get_description();
					}
					if (!(app_key in this._applicationsButtonFromApp)) {

						let applicationButton = new ApplicationButton(this, app, this.pref_display_application_icons);

						var app_is_known = false;
						let i = 0,
							iLen = this._knownApps.length;
						for (; i < iLen; i++) {
							if (this._knownApps[i] == app_key) {
								app_is_known = true;
							}
						}
						if (!app_is_known) {
							if (this._appsWereRefreshed) {
								applicationButton.highlight();
							} else {
								this._knownApps.push(app_key);
							}
						}

						applicationButton.actor.connect('leave-event', Lang.bind(this, this._appLeaveEvent, applicationButton));
						this._addEnterEvent(applicationButton, Lang.bind(this, this._appEnterEvent, applicationButton));
						this._applicationsButtons.push(applicationButton);
						applicationButton.category.push(top_dir.get_menu_id());
						this._applicationsButtonFromApp[app_key] = applicationButton;
					} else {
						this._applicationsButtonFromApp[app_key].category.push(dir.get_menu_id());
					}
				}
			} else if (nextType == CMenu.TreeItemType.DIRECTORY) {
				let subdir = iter.get_directory();
				if (this._loadCategory(subdir, top_dir)) {
					has_entries = true;
				}
			}
		}
		return has_entries;
	},

	_appLeaveEvent: function(a, b, applicationButton) {
		this._previousSelectedActor = applicationButton.actor;
		applicationButton.actor.style_class = "menu-application-button";
		this.selectedAppTitle.set_text("");
		this.selectedAppDescription.set_text("");
	},

	_appEnterEvent: function(applicationButton) {
		this.selectedAppTitle.set_text(applicationButton.app.get_name());
		if (applicationButton.app.get_description())
			this.selectedAppDescription.set_text(applicationButton.app.get_description());
		else
			this.selectedAppDescription.set_text("");
		this._previousVisibleIndex = this.appBoxIter.getVisibleIndex(applicationButton.actor);
		this._clearPrevSelection(applicationButton.actor);
		applicationButton.actor.style_class = "menu-application-button-selected";
	},

	_scrollToButton: function(button) {
		var current_scroll_value = this.applicationsScrollBox.get_vscroll_bar().get_adjustment().get_value();
		var box_height = this.applicationsScrollBox.get_allocation_box().y2 - this.applicationsScrollBox.get_allocation_box().y1;
		var new_scroll_value = current_scroll_value;
		if (current_scroll_value > button.actor.get_allocation_box().y1 - 10) new_scroll_value = button.actor.get_allocation_box().y1 - 10;
		if (box_height + current_scroll_value < button.actor.get_allocation_box().y2 + 10) new_scroll_value = button.actor.get_allocation_box().y2 - box_height + 10;
		if (new_scroll_value != current_scroll_value) this.applicationsScrollBox.get_vscroll_bar().get_adjustment().set_value(new_scroll_value);
	},

	_display: function() {
		this._activeContainer = null;
		this._activeActor = null;
		this.vectorBox = null;
		this.actor_motion_id = 0;
		this.vector_update_loop = null;
		this.current_motion_actor = null;
		let section = new PopupMenu.PopupMenuSection();
		this.menu.addMenuItem(section);

		this.leftPane = new St.BoxLayout({
			vertical: true
		});

		this.leftBox = new St.BoxLayout({
			style_class: 'menu-favorites-box',
			vertical: true
		});

		this._session = new GnomeSession.SessionManager();
		this._screenSaverProxy = new ScreenSaver.ScreenSaverProxy();

		if (this.pref_display_fav_box) {
			this.leftPane.add_actor(this.leftBox, {
				y_align: St.Align.END,
				y_fill: false
			});
		}

		let rightPane = new St.BoxLayout({
			vertical: true
		});
		// this.rightPane = rightPane;

		/**
		 * START mark Odyseus
		 * Moved the selectedAppBox creation up here to allow me to insert it erlier in the rightPane.
		 */
		let searchBoxContainer;

		if (this.pref_custom_launchers_box_placement >= 3 ||
			this.pref_custom_launchers_box_placement === 0)
			searchBoxContainer = rightPane;
		else {
			searchBoxContainer = new St.BoxLayout({
				vertical: false
			});
		}

		this.selectedAppBox = new St.BoxLayout({
			style_class: 'menu-selected-app-box',
			vertical: true
		});
		if (this.pref_apps_info_box_alignment_to_the_left)
			this.selectedAppBox.set_style("text-align: left;");
		else
			this.selectedAppBox.set_style("text-align: right;");

		if (this.selectedAppBox.peek_theme_node() === null ||
			this.selectedAppBox.get_theme_node().get_length('height') === 0)
			this.selectedAppBox.set_height(30 * global.ui_scale);

		this.selectedAppTitle = new St.Label({
			style_class: 'menu-selected-app-title',
			text: ""
		});
		this.selectedAppBox.add_actor(this.selectedAppTitle);
		this.selectedAppDescription = new St.Label({
			style_class: 'menu-selected-app-description',
			text: ""
		});
		this.selectedAppBox.add_actor(this.selectedAppDescription);

		this.myCustomCommandsBox = null;

		if (this.pref_custom_launchers_box_placement !== 0) {
			this.myCustomCommandsBox = new St.BoxLayout({
				vertical: false,
				reactive: true,
				track_hover: true,
				can_focus: true
			});
			this.myCustomCommandsBox.set_width(-1);
			if (this.pref_set_custom_box_padding)
				this.myCustomCommandsBox.set_style("padding-top: " + this.pref_custom_command_box_padding_top +
					"px; padding-right: " + this.pref_custom_command_box_padding_right +
					"px; padding-bottom: " + this.pref_custom_command_box_padding_bottom +
					"px; padding-left: " + this.pref_custom_command_box_padding_left + "px;");
		}

		if (this.pref_show_search_box) {
			this.searchBox = new St.BoxLayout({
				style_class: 'menu-search-box'
			});
		}

		/**
		 * START mark Odyseus
		 */
		let customCmdBoxAlignment;
		switch (this.pref_custom_commands_box_alignment) {
			case 0:
				customCmdBoxAlignment = St.Align.START;
				break;
			case 1:
				customCmdBoxAlignment = St.Align.MIDDLE;
				break;
			case 2:
				customCmdBoxAlignment = St.Align.END;
				break;
		}

		let dummyObj = {
			x_fill: false,
			y_fill: false,
			x_align: customCmdBoxAlignment,
			y_align: St.Align.MIDDLE,
			expand: true
		};

		if (this.myCustomCommandsBox !== null) {
			if (this.pref_custom_launchers_box_placement === 1) { // Left of search box
				searchBoxContainer.add(this.myCustomCommandsBox, dummyObj);
			} else if (this.pref_custom_launchers_box_placement === 3) { // At the top
				rightPane.add(this.myCustomCommandsBox, dummyObj);
			}
		}

		if (this.pref_search_box_bottom)
			this.pref_show_appinfo_box && section.actor.add_actor(this.selectedAppBox);
		else {
			rightPane.add_actor(searchBoxContainer);
			this.pref_show_search_box && searchBoxContainer.add_actor(this.searchBox);
		}

		if (this.pref_show_search_box) {
			this.searchEntry = new St.Entry({
				name: 'menu-search-entry',
				// NOTE: This string could be left blank because it's a default string,
				// so it's already translated by Cinnamon. It's up to the translators.
				hint_text: _("Type to search..."),
				track_hover: true,
				can_focus: true
			});

			/**
			 * START mark Odyseus
			 */
			if (this.pref_set_search_entry_padding)
				this.searchEntry.set_style("padding-top: " + this.pref_search_entry_padding_top +
					"px; padding-right: " + this.pref_search_entry_padding_right +
					"px; padding-bottom: " + this.pref_search_entry_padding_bottom +
					"px; padding-left: " + this.pref_search_entry_padding_left + "px;");

			if (this.pref_set_search_box_padding)
				this.searchBox.set_style("padding-top: " + this.pref_search_box_padding_top +
					"px; padding-right: " + this.pref_search_box_padding_right +
					"px; padding-bottom: " + this.pref_search_box_padding_bottom +
					"px; padding-left: " + this.pref_search_box_padding_left + "px;");
			/**
			 * END
			 */

			this.searchEntry.set_secondary_icon(this._searchInactiveIcon);

			this.searchBox.add(this.searchEntry, {
				x_fill: true,
				x_align: St.Align.START,
				y_align: St.Align.MIDDLE,
				y_fill: false,
				expand: true
			});
			this.searchActive = false;
			this.searchEntryText = this.searchEntry.clutter_text;
			this.searchEntryText.connect('text-changed', Lang.bind(this, this._onSearchTextChanged));
			this.searchEntryText.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
			this._previousSearchPattern = "";
		}
		/**
		 * END
		 */

		this.categoriesApplicationsBox = new CategoriesApplicationsBox();
		rightPane.add_actor(this.categoriesApplicationsBox.actor);
		this.categoriesBox = new St.BoxLayout({
			style_class: 'menu-categories-box',
			vertical: true,
			accessible_role: Atk.Role.LIST
		});
		/**
		 * START mark Odyseus
		 */
		if (this.pref_set_categories_padding)
			this.categoriesBox.set_style("padding-top: " + this.pref_categories_box_padding_top +
				"px; padding-right: " + this.pref_categories_box_padding_right +
				"px; padding-bottom: " + this.pref_categories_box_padding_bottom +
				"px; padding-left: " + this.pref_categories_box_padding_left + "px;");
		/**
		 * END
		 */
		this.applicationsScrollBox = new St.ScrollView({
			x_fill: true,
			y_fill: false,
			y_align: St.Align.START,
			style_class: 'vfade menu-applications-scrollbox'
		});

		/**
		 * START mark Odyseus
		 */
		if (this.pref_hide_applications_list_scrollbar)
			this.applicationsScrollBox.get_vscroll_bar().set_opacity(0);
		else
			this.applicationsScrollBox.get_vscroll_bar().set_opacity(1);
		/**
		 * END
		 */

		this.a11y_settings = new Gio.Settings({
			schema_id: "org.cinnamon.desktop.a11y.applications"
		});
		this.a11y_settings.connect("changed::screen-magnifier-enabled", Lang.bind(this, this._updateVFade));
		this.a11y_mag_settings = new Gio.Settings({
			schema_id: "org.cinnamon.desktop.a11y.magnifier"
		});
		this.a11y_mag_settings.connect("changed::mag-factor", Lang.bind(this, this._updateVFade));

		this._updateVFade();

		this._update_autoscroll();

		let vscroll = this.applicationsScrollBox.get_vscroll_bar();
		vscroll.connect('scroll-start',
			Lang.bind(this, function() {
				this.menu.passEvents = true;
			}));
		vscroll.connect('scroll-stop',
			Lang.bind(this, function() {
				this.menu.passEvents = false;
			}));

		this.applicationsBox = new St.BoxLayout({
			style_class: 'menu-applications-inner-box',
			vertical: true
		});

		this.applicationsBox.add_style_class_name('menu-applications-box'); //this is to support old themes
		this.applicationsScrollBox.add_actor(this.applicationsBox);
		this.applicationsScrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
		if (!this.pref_swap_categories_box)
			this.categoriesApplicationsBox.actor.add_actor(this.categoriesBox);
		this.categoriesApplicationsBox.actor.add_actor(this.applicationsScrollBox);
		if (this.pref_swap_categories_box)
			this.categoriesApplicationsBox.actor.add_actor(this.categoriesBox);

		let fav_obj = new FavoritesBox();
		this.favoritesBox = fav_obj.actor;
		this.leftBox.add_actor(this.favoritesBox, {
			y_align: St.Align.END,
			y_fill: false
		});

		this.mainBox = new St.BoxLayout({
			style_class: 'menu-applications-outer-box',
			vertical: false
		});
		this.mainBox.add_style_class_name('menu-applications-box'); //this is to support old themes

		this.mainBox.add_actor(this.leftPane, {
			span: 1
		});
		this.mainBox.add_actor(rightPane, {
			span: 1
		});

		section.actor.add_actor(this.mainBox);

		/**
		 * START mark Odyseus
		 */
		if (this.pref_search_box_bottom) {
			rightPane.add_actor(searchBoxContainer);
			this.pref_show_search_box && searchBoxContainer.add_actor(this.searchBox);
		} else
			this.pref_show_appinfo_box && section.actor.add_actor(this.selectedAppBox);

		if (this.myCustomCommandsBox !== null) {
			if (this.pref_custom_launchers_box_placement === 2) { // Right of search box
				searchBoxContainer.add(this.myCustomCommandsBox, dummyObj);
			} else if (this.pref_custom_launchers_box_placement === 4) { // At the bottom
				rightPane.add(this.myCustomCommandsBox, dummyObj);
			}
		}
		/**
		 * END
		 */

		this.appBoxIter = new VisibleChildIterator(this.applicationsBox);
		this.applicationsBox._vis_iter = this.appBoxIter;
		this.catBoxIter = new VisibleChildIterator(this.categoriesBox);
		this.categoriesBox._vis_iter = this.catBoxIter;
		this.favBoxIter = new VisibleChildIterator(this.favoritesBox);
		this.favoritesBox._vis_iter = this.favBoxIter;
		Mainloop.idle_add(Lang.bind(this, function() {
			this._clearAllSelections(true);
		}));

		/**
		 * START mark Odyseus
		 */
		if (this.pref_custom_launchers_box_placement < 3) {
			if (this.pref_custom_width_for_searchbox === 0)
				this.searchEntry.set_width(-1);
			else
				this.searchEntry.set_width(this.pref_custom_width_for_searchbox);
		}

		this._updateCustomCommandsBox();
		/**
		 * END
		 */
	},

	/**
	 * START mark Odyseus
	 */
	_updateCustomCommandsBox: function() {
		if (this.myCustomCommandsBox !== null)
			this.myCustomCommandsBox.destroy_all_children();

		if (this.myCustomCommandsBox === null || this._refreshCustomCommandsTimeout !== null)
			return true;

		this._refreshCustomCommandsTimeout = Mainloop.timeout_add(1000, Lang.bind(this, function() {
			this._refreshCustomCommandsTimeout = null;
		}));

		let count = 10;
		let base = "pref_command_";
		let lbl, cmd, icn, desc;

		for (let i = count - 1; i > 0; --i) {
			lbl = this[base + i + "_label"],
				cmd = this[base + i + "_command"],
				icn = this[base + i + "_icon"],
				desc = this[base + i + "_description"];

			if (cmd === "" || icn === "")
				continue;

			let app = {
				command: cmd,
				description: desc,
				label: lbl,
				icon: icn,
				icon_size: PREF_CUSTOM_COMMAND_ICON_SIZE
			};
			if (app) {
				let button = new MyCustomCommandButton(this, app, null);
				this.myCustomCommandsBox.add_actor(button.actor);
			}
		}

		if (this.pref_system_buttons_display === 2)
			this._insertCustomSystemButtons();
	},
	/**
	 * END
	 */

	/**
	 * START mark Odyseus
	 */
	_insertCustomSystemButtons: function() {
		if (this.pref_show_lock_button) { // Lock screen
			let button1 = new MyCustomCommandButton(this, {
				command: null,
				description: _("Lock the screen"),
				label: _("Lock screen"),
				icon: (this.pref_lock_button_custom_icon === "" ?
					"system-lock-screen" :
					this.pref_lock_button_custom_icon),
				icon_size: PREF_CUSTOM_COMMAND_ICON_SIZE
			}, Lang.bind(this, function() {
				this.menu.close(this.pref_animate_menu);

				let screensaver_settings = new Gio.Settings({
					schema_id: "org.cinnamon.desktop.screensaver"
				});
				let screensaver_dialog = Gio.file_new_for_path("/usr/bin/cinnamon-screensaver-command");
				if (screensaver_dialog.query_exists(null)) {
					if (screensaver_settings.get_boolean("ask-for-away-message")) {
						Util.spawnCommandLine("cinnamon-screensaver-lock-dialog");
					} else {
						Util.spawnCommandLine("cinnamon-screensaver-command --lock");
					}
				} else {
					this._screenSaverProxy.LockRemote("");
				}
			}));
			this.myCustomCommandsBox.add_actor(button1.actor);
		}

		if (this.pref_show_logout_button) { // Logout button
			let button2 = new MyCustomCommandButton(this, {
				command: null,
				description: _("Leave the session"),
				label: _("Logout"),
				icon: (this.pref_logout_button_custom_icon === "" ?
					"system-lock-screen" :
					this.pref_logout_button_custom_icon),
				icon_size: PREF_CUSTOM_COMMAND_ICON_SIZE
			}, Lang.bind(this, function() {
				this.menu.close(this.pref_animate_menu);
				this._session.LogoutRemote(0);
			}));
			this.myCustomCommandsBox.add_actor(button2.actor);
		}

		if (this.pref_show_shutdown_button) { // Shutdown button
			let button3 = new MyCustomCommandButton(this, {
				command: null,
				description: _("Shutdown the computer"),
				label: _("Quit"),
				icon: (this.pref_shutdown_button_custom_icon === "" ?
					"system-lock-screen" :
					this.pref_shutdown_button_custom_icon),
				icon_size: PREF_CUSTOM_COMMAND_ICON_SIZE
			}, Lang.bind(this, function() {
				this.menu.close(this.pref_animate_menu);
				this._session.ShutdownRemote();
			}));
			this.myCustomCommandsBox.add_actor(button3.actor);
		}
	},

	_expand_applet_context_menu: function() {
		// NOTE: This string could be left blank because it's a default string,
		// so it's already translated by Cinnamon. It's up to the translators.
		let menuItem = new PopupMenu.PopupIconMenuItem(_("Open the menu editor"),
			"text-editor", St.IconType.SYMBOLIC);
		menuItem.connect("activate", Lang.bind(this, this._launch_editor));
		this._applet_context_menu.addMenuItem(menuItem);

		menuItem = new PopupMenu.PopupIconMenuItem(_("Help"),
			"dialog-information", St.IconType.SYMBOLIC);
		menuItem.connect("activate", Lang.bind(this, function() {
			Util.spawnCommandLine("xdg-open " + this._applet_dir + "/HELP.md");
		}));
		this._applet_context_menu.addMenuItem(menuItem);

		// NOTE: This string could be left blank because it's a default string,
		// so it's already translated by Cinnamon. It's up to the translators.
		this.context_menu_item_remove = new PopupMenu.PopupIconMenuItem(_("Remove '%s'")
			.format(this._metadata.name),
			"edit-delete",
			St.IconType.SYMBOLIC);
		this.context_menu_item_remove.connect('activate', Lang.bind(this, function() {
			new ConfirmationDialog(Lang.bind(this, function() {
					Main.AppletManager._removeAppletFromPanel(this._metadata.uuid, this._instance_id);
				}),
				this._metadata.name,
				_("Are you sure that you want to remove '%s' from your panel?")
				.format(this._metadata.name),
				_("Cancel"), _("OK")).open();
		}));
	},

	/**
	 * END
	 */

	_updateVFade: function() {
		let mag_on = this.a11y_settings.get_boolean("screen-magnifier-enabled") &&
			this.a11y_mag_settings.get_double("mag-factor") > 1.0;
		if (mag_on) {
			this.applicationsScrollBox.style_class = "menu-applications-scrollbox";
		} else {
			this.applicationsScrollBox.style_class = "vfade menu-applications-scrollbox";
		}
	},

	_update_autoscroll: function() {
		this.applicationsScrollBox.set_auto_scrolling(this.pref_enable_autoscroll);
	},

	_clearAllSelections: function(hide_apps) {
		let actors1 = this.applicationsBox.get_children();
		let a = 0,
			aLen = actors1.length;
		for (; a < aLen; a++) {
			let actor = actors1[a];
			actor.style_class = "menu-application-button";
			if (hide_apps) {
				actor.hide();
			}
		}
		let actors2 = this.categoriesBox.get_children();
		let b = 0,
			bLen = actors2.length;
		for (; b < bLen; b++) {
			let actor = actors2[b];
			actor.style_class = "menu-category-button";
			actor.show();
		}
		let actors3 = this.favoritesBox.get_children();
		let c = 0,
			cLen = actors3.length;
		for (; c < cLen; c++) {
			let actor = actors3[c];
			actor.remove_style_pseudo_class("hover");
			actor.show();
		}
		if (this.myCustomCommandsBox !== null) {
			let actors4 = this.myCustomCommandsBox.get_children();
			let d = 0,
				dLen = actors3.length;
			for (; d < dLen; d++) {
				let actor = actors3[d];
				actor.remove_style_pseudo_class("hover");
				actor.show();
			}
		}
	},

	_select_category: function(dir, categoryButton) {
		if (dir) {
			/**
			 * START mark Odyseus
			 */
			if (dir === "favorites")
				this._displayButtons(dir);
			else if (dir === "recentApps")
				this._displayButtons(dir, null, null, null, null, true);
			else
				this._displayButtons(this._listApplications(dir.get_menu_id()));
			/**
			 * END
			 */
		} else
			this._displayButtons(this._listApplications(null));
		this.closeContextMenus(null, false);
	},

	closeContextMenus: function(excluded, animate) {
		for (let app in this._applicationsButtons) {
			if (app != excluded && this._applicationsButtons[app].menu.isOpen) {
				if (animate)
					this._applicationsButtons[app].toggleMenu();
				else
					this._applicationsButtons[app].closeMenu();
			}
		}

		for (let recent in this._recentButtons) {
			if (recent != excluded && this._recentButtons[recent].menu.isOpen) {
				if (animate)
					this._recentButtons[recent].toggleMenu();
				else
					this._recentButtons[recent].closeMenu();
			}
		}

		/**
		 * START mark Odyseus
		 * Close all recent apps context menus when switching categories.
		 */
		for (let recentApp in this._recentAppsButtons) {
			if (recentApp != excluded && this._recentAppsButtons[recentApp].menu.isOpen) {
				if (animate)
					this._recentAppsButtons[recentApp].toggleMenu();
				else
					this._recentAppsButtons[recentApp].closeMenu();
			}
		}
		/**
		 * END
		 */
	},

	_resize_actor_iter: function(actor) {
		let [min, nat] = actor.get_preferred_width(-1.0);
		if (nat > this._applicationsBoxWidth) {
			this._applicationsBoxWidth = nat;
			this.applicationsBox.set_width(this._applicationsBoxWidth + 42); // The answer to life...
		}
	},

	_resizeApplicationsBox: function() {
		this._applicationsBoxWidth = 0;
		this.applicationsBox.set_width(-1);
		let child = this.applicationsBox.get_first_child();
		this._resize_actor_iter(child);

		while ((child = child.get_next_sibling()) !== null) {
			this._resize_actor_iter(child);
		}
	},

	_displayButtons: function(appCategory, places, recent, apps, autocompletes, recentApps) {
		if (appCategory) {
			if (appCategory == "all") {
				this._applicationsButtons.forEach(function(item, index) {
					item.actor.show();
				});
				/**
				 * START mark Odyseus
				 */
			} else if (appCategory === "favorites") {
				this._applicationsButtons.forEach(function(item, index) {
					if (AppFavorites.getAppFavorites().isFavorite(item.app.get_id())) {
						item.actor.show();
					} else {
						item.actor.hide();
					}
				});
			} else {
				/**
				 * END
				 */
				this._applicationsButtons.forEach(function(item, index) {
					if (item.category.indexOf(appCategory) != -1) {
						item.actor.show();
					} else {
						item.actor.hide();
					}
				});
			}
		} else if (apps) {
			let i = 0,
				iLen = this._applicationsButtons.length;
			for (; i < iLen; i++) {
				/**
				 * START mark Odyseus
				 */
				// From Sane menu
				if (apps.indexOf(this._applicationsButtons[i].app.get_id()) != -1) {
					if (this.pref_fuzzy_search_enabled && !appCategory) {
						this.applicationsBox.add_actor(this._applicationsButtons[i].actor);
						this.applicationsBox.add_actor(this._applicationsButtons[i].menu.actor);
					} else
						this._applicationsButtons[i].actor.show();
				} else {
					this.pref_fuzzy_search_enabled || this._applicationsButtons[i].actor.hide();
				}
				/**
				 * END
				 */
			}
		} else {
			this._applicationsButtons.forEach(function(item, index) {
				item.actor.hide();
			});
		}
		if (places) {
			if (places == -1) {
				this._placesButtons.forEach(function(item, index) {
					item.actor.show();
				});
			} else {
				let i = 0,
					iLen = this._placesButtons.length;
				for (; i < iLen; i++) {
					if (places.indexOf(this._placesButtons[i].button_name) != -1) {
						this._placesButtons[i].actor.show();
					} else {
						this._placesButtons[i].actor.hide();
					}
				}
			}
		} else {
			this._placesButtons.forEach(function(item, index) {
				item.actor.hide();
			});
		}
		if (recent) {
			if (recent == -1) {
				this._recentButtons.forEach(function(item, index) {
					item.actor.show();
				});
			} else {
				let i = 0,
					iLen = this._recentButtons.length;
				for (; i < iLen; i++) {
					if (recent.indexOf(this._recentButtons[i].button_name) != -1) {
						this._recentButtons[i].actor.show();
					} else {
						this._recentButtons[i].actor.hide();
					}
				}
			}
		} else {
			this._recentButtons.forEach(function(item, index) {
				item.actor.hide();
			});
		}
		if (recentApps) {
			this._recentAppsButtons.forEach(function(item, index) {
				item.actor.show();
			});
		} else {
			this._recentAppsButtons.forEach(function(item, index) {
				item.actor.hide();
			});
		}
		if (autocompletes) {

			this._transientButtons.forEach(function(item, index) {
				item.actor.destroy();
			});
			this._transientButtons = [];

			let i = 0,
				iLen = autocompletes.length;
			for (; i < iLen; i++) {
				let button = new TransientButton(this, autocompletes[i]);
				button.actor.connect('leave-event', Lang.bind(this, this._appLeaveEvent, button));
				this._addEnterEvent(button, Lang.bind(this, this._appEnterEvent, button));
				this._transientButtons.push(button);
				this.applicationsBox.add_actor(button.actor);
				button.actor.realize();
			}
		}

		this._searchProviderButtons.forEach(function(item, index) {
			if (item.actor.visible) {
				item.actor.hide();
			}
		});
	},

	_setCategoriesButtonActive: function(active) {
		try {
			let categoriesButtons = this.categoriesBox.get_children();
			for (let i in categoriesButtons) {
				let button = categoriesButtons[i];
				if (active) {
					button.set_style_class_name("menu-category-button");
				} else {
					button.set_style_class_name("menu-category-button-greyed");
				}
			}
		} catch (e) {
			global.log(e);
		}
	},

	resetSearch: function() {
		this.searchEntry.set_text("");
		this._previousSearchPattern = "";
		this.searchActive = false;
		this._clearAllSelections(true);
		this._setCategoriesButtonActive(true);
		global.stage.set_key_focus(this.searchEntry);
	},

	_onSearchTextChanged: function(se, prop) {
		if (this.menuIsOpening) {
			this.menuIsOpening = false;
			return;
		} else {
			let searchString = this.searchEntry.get_text();
			if (searchString === '' && !this.searchActive)
				return;
			this._fileFolderAccessActive = this.searchActive && this.pref_search_filesystem;
			this._clearAllSelections(false);
			this.searchActive = searchString !== '';
			if (this.searchActive) {
				this.searchEntry.set_secondary_icon(this._searchActiveIcon);
				if (this._searchIconClickedId === 0) {
					this._searchIconClickedId = this.searchEntry.connect('secondary-icon-clicked',
						Lang.bind(this, function() {
							this.resetSearch();
							/**
							 * START mark Odyseus
							 */
							this._select_category(this.pref_hide_allapps_category ?
								this._initialSelectedCategory :
								null, this._allAppsCategoryButton);
							/**
							 * END
							 */
						}));
				}
				this._setCategoriesButtonActive(false);
				this._doSearch();
			} else {
				/**
				 * START mark Odyseus
				 */
				// From Sane Menu
				// TODO: Find a better way to restore initial state
				if (this.pref_fuzzy_search_enabled) {
					this._refreshApps();
					if (this.pref_show_places)
						this._refreshPlaces();
					if (this.privacy_settings.get_boolean(REMEMBER_RECENT_KEY))
						this._refreshRecent();
					if (this.pref_remember_recently_used_apps)
						this._refreshRecentApps();
				}
				// this._refreshApps();
				/**
				 * END
				 */

				if (this._searchIconClickedId > 0)
					this.searchEntry.disconnect(this._searchIconClickedId);
				this._searchIconClickedId = 0;
				this.searchEntry.set_secondary_icon(this._searchInactiveIcon);
				this._previousSearchPattern = "";
				this._setCategoriesButtonActive(true);
				/**
				 * START mark Odyseus
				 */
				this._select_category(this.pref_hide_allapps_category ?
					this._initialSelectedCategory :
					null, this._allAppsCategoryButton);
				/**
				 * END
				 */
			}
			return;
		}
	},

	_listBookmarks: function(pattern) {
		let bookmarks = Main.placesManager.getBookmarks();
		var res = [];
		let id = 0,
			idLen = bookmarks.length;
		for (; id < idLen; id++) {
			if (!pattern || bookmarks[id].name.toLowerCase().indexOf(pattern) != -1) res.push(bookmarks[id]);
		}
		return res;
	},

	_listDevices: function(pattern) {
		let devices = Main.placesManager.getMounts();
		var res = [];
		let id = 0,
			idLen = devices.length;
		for (; id < idLen; id++) {
			if (!pattern || devices[id].name.toLowerCase().indexOf(pattern) != -1) res.push(devices[id]);
		}
		return res;
	},

	_listApplications: function(category_menu_id, pattern) {
		var applist = [];
		if (category_menu_id) {
			applist = category_menu_id;
		} else {
			applist = "all";
		}
		let res;
		if (pattern) {
			res = [];
			/**
			 * START mark Odyseus
			 */
			// From Sane Menu
			this._applicationsOrder = {};
			/**
			 * END
			 */
			for (let i in this._applicationsButtons) {
				let app = this._applicationsButtons[i].app;
				/**
				 * START mark Odyseus
				 */
				// From Sane Menu
				if (this.pref_fuzzy_search_enabled) {
					let fuzzy = this._fuzzysearch(pattern, Util.latinise(app.get_name().toLowerCase()));
					if (fuzzy[0]) {
						res.push(app.get_id());
						this._applicationsOrder[app.get_id()] = fuzzy[1];
					}
				} else {
					if (Util.latinise(app.get_name().toLowerCase()).indexOf(pattern) != -1 ||
						(app.get_keywords() && Util.latinise(app.get_keywords().toLowerCase()).indexOf(pattern) != -1) ||
						(app.get_description() && Util.latinise(app.get_description().toLowerCase()).indexOf(pattern) != -1) ||
						(app.get_id() && Util.latinise(app.get_id().slice(0, -8).toLowerCase()).indexOf(pattern) != -1))
						res.push(app.get_id());
				}
				/**
				 * END
				 */
			}
		} else
			res = applist;
		return res;
	},

	/**
	 * START mark Odyseus
	 */
	// From Sane Menu
	_fuzzysort: function(order) {
		return function(a, b) {
			a = a.app.get_id();
			b = b.app.get_id();
			var avalue = order[a] || 99999;
			var bvalue = order[b] || 99999;
			return avalue > bvalue;
		};
	},
	/**
	 * END
	 */

	/**
	 * START mark Odyseus
	 */
	// From Sane Menu
	_fuzzysearch: function(needle, haystack) {
		var hlen = haystack.length;
		var nlen = needle.length;
		var OccurrenceAt = 0;
		var previousJ = 0;
		if (nlen > hlen) {
			return [false, 0];
		}
		if (nlen === hlen) {
			return [needle === haystack, 0];
		}
		outer: for (var i = 0, j = 0; i < nlen; i++) {
			var nch = needle.charCodeAt(i);
			while (j < hlen) {
				if (haystack.charCodeAt(j++) === nch) {
					if (previousJ === 0) previousJ = j;
					else {
						if (haystack.charCodeAt(j - 2) == 32 && (previousJ == 1 || haystack.charCodeAt(previousJ - 1) == 32)) {
							// if every character in search pattern is preceded by a space and matches it should be first result
							OccurrenceAt -= 100;
						} else {
							// otherwise sort result based on the distance between matching characters
							OccurrenceAt = OccurrenceAt + ((j - previousJ - 1) * 10);
						}
						previousJ = j;
					}
					OccurrenceAt += j;
					continue outer;
				}
			}
			return [false, 0];
		}
		return [true, OccurrenceAt];
	},
	/**
	 * END
	 */

	_doSearch: function() {
		this._searchTimeoutId = 0;
		let pattern = this.searchEntryText.get_text().replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();
		pattern = Util.latinise(pattern);
		if (pattern == this._previousSearchPattern)
			return false;
		this._previousSearchPattern = pattern;
		this._activeContainer = null;
		this._activeActor = null;
		this._selectedItemIndex = null;
		this._previousTreeSelectedActor = null;
		this._previousSelectedActor = null;

		// _listApplications returns all the applications when the search
		// string is zero length. This will happened if you type a space
		// in the search entry.
		if (pattern.length === 0) {
			return false;
		}

		var appResults = this._listApplications(null, pattern);
		var placesResults = [];
		var bookmarks = this._listBookmarks(pattern);
		for (let a in bookmarks)
			placesResults.push(bookmarks[a].name);
		var devices = this._listDevices(pattern);
		for (let b in devices)
			placesResults.push(devices[b].name);
		var recentResults = [];
		let c = 0,
			cLen = this._recentButtons.length;
		for (; c < cLen; c++) {
			if (!(this._recentButtons[c] instanceof RecentClearButton) && this._recentButtons[c].button_name.toLowerCase().indexOf(pattern) != -1)
				recentResults.push(this._recentButtons[c].button_name);
		}

		var acResults = []; // search box autocompletion results
		if (this.pref_search_filesystem) {
			// Don't use the pattern here, as filesystem is case sensitive
			acResults = this._getCompletions(this.searchEntryText.get_text());
		}

		/**
		 * START mark Odyseus
		 */
		// From Sane Menu
		// remove all buttons here for sort to have effect
		if (this.pref_fuzzy_search_enabled) {
			this.applicationsBox.remove_all_children();
			this._applicationsButtons = this._applicationsButtons.sort(this._fuzzysort(this._applicationsOrder));
		}
		/**
		 * END
		 */

		this._displayButtons(null, placesResults, recentResults, appResults, acResults);

		this.appBoxIter.reloadVisible();
		if (this.appBoxIter.getNumVisibleChildren() > 0) {
			let item_actor = this.appBoxIter.getFirstVisible();
			this._selectedItemIndex = this.appBoxIter.getAbsoluteIndexOfChild(item_actor);
			this._activeContainer = this.applicationsBox;
			if (item_actor && item_actor != this.searchEntry) {
				item_actor._delegate.emit('enter-event');
			}
		}

		SearchProviderManager.launch_all(pattern, Lang.bind(this, function(provider, results) {
			try {
				for (let i in results) {
					if (results[i].type != 'software') {
						let button = new SearchProviderResultButton(this, provider, results[i]);
						button.actor.connect('leave-event', Lang.bind(this, this._appLeaveEvent, button));
						this._addEnterEvent(button, Lang.bind(this, this._appEnterEvent, button));
						this._searchProviderButtons.push(button);
						this.applicationsBox.add_actor(button.actor);
						button.actor.realize();
					}
				}
			} catch (e) {
				global.log(e);
			}
		}));

		return false;
	},

	_getCompletion: function(text) {
		if (text.indexOf('/') != -1) {
			if (text.substr(text.length - 1) == '/') {
				return '';
			} else {
				return this._pathCompleter.get_completion_suffix(text);
			}
		} else {
			return false;
		}
	},

	_getCompletions: function(text) {
		if (text.indexOf('/') != -1) {
			return this._pathCompleter.get_completions(text);
		} else {
			return [];
		}
	},

	_run: function(input) {
		let command = input;

		this._commandError = false;
		if (input) {
			let path = null;
			if (input.charAt(0) == '/') {
				path = input;
			} else {
				if (input.charAt(0) == '~')
					input = input.slice(1);
				path = GLib.get_home_dir() + '/' + input;
			}

			if (GLib.file_test(path, GLib.FileTest.EXISTS)) {
				let file = Gio.file_new_for_path(path);
				try {
					Gio.app_info_launch_default_for_uri(file.get_uri(),
						global.create_app_launch_context());
				} catch (e) {
					// The exception from gjs contains an error string like:
					//     Error invoking Gio.app_info_launch_default_for_uri: No application
					//     is registered as handling this file
					// We are only interested in the part after the first colon.
					//let message = e.message.replace(/[^:]*: *(.+)/, '$1');
					return false;
				}
			} else {
				return false;
			}
		}

		return true;
	},

	on_applet_removed_from_panel: function() {
		this.settings.finalize();
	}
};

/**
 * START mark Odyseus
 */
function SeparatorBox(aHaveLine, aSpace, aIsVertical) {
	this._init(aHaveLine, aSpace, aIsVertical);
}

SeparatorBox.prototype = {
	_init: function(aHaveLine, aSpace, aIsVertical) {
		this.actor = new St.BoxLayout({
			vertical: aIsVertical
		});
		this.separatorLine = new PopupMenu.PopupSeparatorMenuItem();
		this.actor.add_actor(this.separatorLine.actor);
		this.setLineVisible(aHaveLine);
		this.setSpace(aSpace);
	},

	destroy: function() {
		this.separatorLine.destroy();
		this.actor.destroy();
	},

	setSpace: function(aSpace) {
		this.space = aSpace;
		if (this.actor.get_vertical()) {
			this.actor.set_width(-1);
			this.actor.set_height(aSpace);
		} else {
			this.actor.set_width(aSpace);
			this.actor.set_height(-1);
		}
	},

	setLineVisible: function(aShow) {
		this.haveLine = aShow;
		this.separatorLine.actor.visible = aShow;
	}
};

function MyCustomCommandButton(aApplet, aApp, aCallback) {
	this._init(aApplet, aApp, aCallback);
}

MyCustomCommandButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(aApplet, aApp, aCallback) {
		this.app = aApp;
		this.applet = aApplet;
		this.callback = aCallback;

		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: true
		});

		this.actor = new St.Bin({
			style_class: 'customcommand-button-container'
		});

		this.button = new St.Button({
			style_class: 'customcommand-button'
		});
		let icon_size = this.app.icon_size;
		let icon_type = (this.app.icon.search("-symbolic") !== -1) ? 0 : 1;
		let iconObj = {
			icon_size: icon_size,
			icon_type: icon_type,
			style_class: "customcommand-button-icon",
		};
		if (this.app.icon.indexOf("/") !== -1)
			iconObj["gicon"] = new Gio.FileIcon({
				file: Gio.file_new_for_path(this.app.icon)
			});
		else
			iconObj["icon_name"] = this.app.icon;

		this.icon = new St.Icon(iconObj);
		this.button.set_child(this.icon);
		this.actor.add_actor(this.button);

		this.button.set_style_class_name("menu-application-button");
		this.button.connect("clicked", Lang.bind(this, this._activate, aCallback));
		this.button.connect("enter-event", Lang.bind(this, this._enterEvent));
		this.button.connect("leave-event", Lang.bind(this, this._leaveEvent));

		this.isDraggableApp = false;
	},

	_enterEvent: function() {
		this.button.style_class = "menu-application-button-selected";
		this.actor.add_style_pseudo_class("hover");
		this.applet.selectedAppTitle.set_text(this.app.label);
		if (this.app.description)
			this.applet.selectedAppDescription.set_text(this.app.description.split("\n")[0]);
		else
			this.applet.selectedAppDescription.set_text("");
	},

	_leaveEvent: function() {
		this.button.style_class = "menu-application-button";
		this.actor.remove_style_pseudo_class("hover");
		this.applet.selectedAppTitle.set_text("");
		this.applet.selectedAppDescription.set_text("");
	},

	_activate: function(event, aCallback) {
		if (this.callback) {
			this.callback();
		} else {
			let cmd = this.app.command;
			try { // Try to execute
				GLib.spawn_command_line_async(cmd);
			} catch (aErr1) {
				try {
					if (cmd.indexOf("/") !== -1) // Try to open file if cmd is a path
						Main.Util.spawnCommandLine("xdg-open " + cmd);
				} catch (aErr2) {
					Main.notify("[Custom Cinnamon Menu]", aErr2.message);
				}
			}
		}
		this.applet.menu.close(PREF_ANIMATE_MENU);
	},
};

function RecentAppsCategoryButton(app, showIcon) {
	this._init(app, showIcon);
}

RecentAppsCategoryButton.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(category, showIcon) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, {
			hover: false
		});
		this.actor.set_style_class_name('menu-category-button');
		this.actor._delegate = this;
		this.label = new St.Label({
			text: _("Recent Applications"),
			style_class: 'menu-category-button-label'
		});
		if (showIcon) {
			this.icon = new St.Icon({
				icon_name: PREF_CUSTOM_ICON_FOR_REC_APPS_CAT,
				icon_size: PREF_CATEGORY_ICON_SIZE,
				icon_type: St.IconType.FULLCOLOR
			});
			this.addActor(this.icon);
			this.icon.realize();
		} else {
			this.icon = null;
		}
		this.addActor(this.label);
		this.label.realize();
	}
};

function ShellOutputProcess(command_argv) {
	this._init(command_argv);
}

ShellOutputProcess.prototype = {

	_init: function(command_argv) {
		this.command_argv = command_argv;
		this.flags = GLib.SpawnFlags.SEARCH_PATH;
		this.success = false;
		this.standard_output_content = "";
		this.standard_error_content = "";
		this.pid = -1;
		this.standard_input_file_descriptor = -1;
		this.standard_output_file_descriptor = -1;
		this.standard_error_file_descriptor = -1;
	},

	spawn_sync_and_get_output: function() {
		this.spawn_sync();
		let output = this.get_standard_output_content();
		return output;
	},

	spawn_sync: function() {
		let [success, standard_output_content, standard_error_content] = GLib.spawn_sync(
			null,
			this.command_argv,
			null,
			this.flags,
			null);
		this.success = success;
		this.standard_output_content = standard_output_content;
		this.standard_error_content = standard_error_content;
	},

	get_standard_output_content: function() {
		return this.standard_output_content.toString();
	},

	spawn_sync_and_get_error: function() {
		this.spawn_sync();
		let output = this.get_standard_error_content();
		return output;
	},

	get_standard_error_content: function() {
		return this.standard_error_content.toString();
	},

	spawn_async: function() {
		let [success, pid, standard_input_file_descriptor,
			standard_output_file_descriptor, standard_error_file_descriptor
		] = GLib.spawn_async_with_pipes(
			null,
			this.command_argv,
			null,
			this.flags,
			null,
			null);

		this.success = success;
		this.pid = pid;
		this.standard_input_file_descriptor = standard_input_file_descriptor;
		this.standard_output_file_descriptor = standard_output_file_descriptor;
		this.standard_error_file_descriptor = standard_error_file_descriptor;
	},

};

function ConfirmationDialog() {
	this._init.apply(this, arguments);
}

ConfirmationDialog.prototype = {
	__proto__: ModalDialog.ModalDialog.prototype,

	_init: function(aCallback, aDialogLabel, aDialogMessage, aCancelButtonLabel, aDoButtonLabel) {
		ModalDialog.ModalDialog.prototype._init.call(this, {
			styleClass: null
		});

		let mainContentBox = new St.BoxLayout({
			style_class: 'polkit-dialog-main-layout',
			vertical: false
		});
		this.contentLayout.add(mainContentBox, {
			x_fill: true,
			y_fill: true
		});

		let messageBox = new St.BoxLayout({
			style_class: 'polkit-dialog-message-layout',
			vertical: true
		});
		mainContentBox.add(messageBox, {
			y_align: St.Align.START
		});

		this._subjectLabel = new St.Label({
			style_class: 'polkit-dialog-headline',
			text: aDialogLabel
		});

		messageBox.add(this._subjectLabel, {
			y_fill: false,
			y_align: St.Align.START
		});

		this._descriptionLabel = new St.Label({
			style_class: 'polkit-dialog-description',
			text: aDialogMessage
		});

		messageBox.add(this._descriptionLabel, {
			y_fill: true,
			y_align: St.Align.START
		});

		this.setButtons([{
			label: aCancelButtonLabel,
			action: Lang.bind(this, function() {
				this.close();
			}),
			key: Clutter.Escape
		}, {
			label: aDoButtonLabel,
			action: Lang.bind(this, function() {
				this.close();
				aCallback();
			})
		}]);
	}
};
/**
 * END
 */

function main(metadata, orientation, panel_height, instance_id) {
	let myApplet = new MyApplet(metadata, orientation, panel_height, instance_id);
	return myApplet;
}