/**
 * [Desktop Handler]
 *
 * This applet is based on other applets/extensions for Cinnamon:
 *     - Smart Panel Extension By mohammad-sn.
 *     - Show Desktop ++ Applet By mohammad-sn.
 */

const Lang = imports.lang;
const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext.domain("cinnamon-applets");
const Gtk = imports.gi.Gtk;
const _ = Gettext.gettext;

const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const ExtensionSystem = imports.ui.extensionSystem;
const Gio = imports.gi.Gio;
const Settings = imports.ui.settings;
const Tweener = imports.ui.tweener;
const St = imports.gi.St;
const Cinnamon = imports.gi.Cinnamon;
const Util = imports.misc.util;
const Meta = imports.gi.Meta;

const CoverflowSwitcher = imports.ui.appSwitcher.coverflowSwitcher;
const TimelineSwitcher = imports.ui.appSwitcher.timelineSwitcher;
const ClassicSwitcher = imports.ui.appSwitcher.classicSwitcher;
const AppSwitcher = imports.ui.appSwitcher.appSwitcher;
const Tooltips = imports.ui.tooltips;
const PopupMenu = imports.ui.popupMenu;
const AppletManager = imports.ui.appletManager;

/**
 * #MenuItem
 * @_text (string): Text to be displayed in the menu item
 * @_icon (string): Name of icon to be displayed in the menu item
 * @_callback (Function): Callback function when the menu item is clicked
 * @icon (St.Icon): Icon of the menu item
 *
 * A menu item that contains an icon, a text and responds to clicks
 *
 * Inherits: PopupMenu.PopupBaseMenuItem
 */
function MenuItem(label, icon, callback) {
	this._init(label, icon, callback);
}

MenuItem.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	/**
	 * _init:
	 * @text (string): text to be displayed in the menu item
	 * @icon (string): name of icon to be displayed in the menu item
	 * @callback (Function): callback function to be called when the menu item is clicked
	 *
	 * Constructor function
	 */
	_init: function(text, icon, callback) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this);

		this._text = text;
		this._icon = icon;
		this._callback = callback;

		let table = new St.Table({
			homogeneous: false,
			reactive: true
		});
		this.icon = icon;
		table.add(this.icon, {
			row: 0,
			col: 0,
			col_span: 1,
			x_expand: false,
			x_align: St.Align.START
		});

		this.label = new St.Label({
			text: text
		});
		this.label.set_margin_left(6.0);
		table.add(this.label, {
			row: 0,
			col: 1,
			col_span: 1,
			x_align: St.Align.START
		});
		this.addActor(table, {
			expand: true,
			span: 1,
			align: St.Align.START
		});
		this.connect('activate', callback);
	},

	/**
	 * clone:
	 * 
	 * Clones the menu item
	 * 
	 * Returns (MenuItem): a clone of this menu item
	 */
	clone: function() {
		return new MenuItem(this._text, this._icon, this._callback);
	}
};

function MyApplet(aMetadata, aOrientation, aPanel_height, aInstance_id) {
	this._init(aMetadata, aOrientation, aPanel_height, aInstance_id);
}

MyApplet.prototype = {
	__proto__: Applet.TextIconApplet.prototype,

	_init: function(aMetadata, aOrientation, aPanel_height, aInstance_id) {
		Applet.TextIconApplet.prototype._init.call(this, aOrientation, aPanel_height, aInstance_id);

		this.settings = new Settings.AppletSettings(this, aMetadata["uuid"], aInstance_id);

		this._bind_settings();

		this.cwm_settings = new Gio.Settings({
			schema: "org.cinnamon.desktop.wm.preferences"
		});
		this.muf_settings = new Gio.Settings({
			schema: "org.cinnamon.muffin"
		});

		this._lastScroll = Date.now();
		this.didpeek = false;
		this.uptgg = true;
		this._orientation = aOrientation;
		this._instance_id = aInstance_id;

		try {

			this.actor.connect("scroll-event", Lang.bind(this, this._onScroll));

			this._handleDesktopPeek();
			this._handleWindowList();
			this._setAppletStyle();

			// Workaround to apply background color on applet load.
			// Without the timeout, the style is not applied.
			Mainloop.timeout_add(3000, Lang.bind(this, function() {
				this._setAppletStyle(true);
			}));

		} catch (e) {
			global.logError(e);
		}

		// for (let prop in Clutter) {
		// 	global.logError(prop);
		// }
	},

	_bind_settings: function() {
		let settingsArray = [
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_applet_background_color", this._setAppletStyle],
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_applet_with", this._setAppletStyle],
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_custom_icon", this._setAppletStyle],
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_scroll_action", this._onScrollActionChanged],
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_separated_scroll_action", this._onScrollSettingsChanged],
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_left_click_action", this._setAppletTooltip],
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_middle_click_action", this._setAppletTooltip],
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_windows_list_menu_enabled", function() {
				this._handleWindowList();
				this._setAppletTooltip();
			}],
			[Settings.BindingDirection.BIDIRECTIONAL, "pref_button_to_open_menu", function() {
				this._handleWindowList();
				this._setAppletTooltip();
			}],
			[Settings.BindingDirection.IN, "pref_scroll_up_action", this._onScrollSettingsChanged],
			[Settings.BindingDirection.IN, "pref_scroll_down_action", this._onScrollSettingsChanged],
			[Settings.BindingDirection.IN, "pref_custom_cmd1_action", null],
			[Settings.BindingDirection.IN, "pref_custom_cmd2_action", null],
			[Settings.BindingDirection.IN, "pref_custom_cmd3_action", null],
			[Settings.BindingDirection.IN, "pref_custom_cmd4_action", null],
			[Settings.BindingDirection.IN, "pref_prevent_fast_scroll", null],
			[Settings.BindingDirection.IN, "pref_scroll_delay", null],
			[Settings.BindingDirection.IN, "pref_switcher_style", null],
			[Settings.BindingDirection.IN, "pref_switcher_scope", null],
			[Settings.BindingDirection.IN, "pref_switcher_modified", null],
			[Settings.BindingDirection.IN, "pref_switcher_modifier", null],
			[Settings.BindingDirection.IN, "pref_show_context_menu_default_items", null],
			[Settings.BindingDirection.IN, "pref_show_context_menu_about", null],
			[Settings.BindingDirection.IN, "pref_show_context_menu_configure", null],
			[Settings.BindingDirection.IN, "pref_show_context_menu_remove", null],
			[Settings.BindingDirection.IN, "pref_keep_menu_open", this.updateMenu],
			[Settings.BindingDirection.IN, "pref_show_close_buttons", null],
			[Settings.BindingDirection.IN, "pref_show_close_all_buttons", null],
			[Settings.BindingDirection.IN, "pref_peek_desktop_enabled", this._handleDesktopPeek],
			[Settings.BindingDirection.IN, "pref_peek_desktop_delay", null],
			[Settings.BindingDirection.IN, "pref_peek_opacity", null],
			[Settings.BindingDirection.IN, "pref_opacify_desktop_icons", null],
			[Settings.BindingDirection.IN, "pref_opacify_desklets", null],
			[Settings.BindingDirection.IN, "pref_blur_effect_enabled", null],
		];
		for (let [binding, property_name, callback] of settingsArray) {
			this.settings.bindProperty(binding, property_name, property_name, callback, null);
		}
	},

	_handleDesktopPeek: function() {
		try {
			this.actor.disconnect(this.enterAct);
			this.actor.disconnect(this.leaveAct);
		} catch (aErr) {}

		if (!this.pref_peek_desktop_enabled)
			return true;

		this.enterAct = this.actor.connect("enter-event", Lang.bind(this, this._onEntered));
		this.leaveAct = this.actor.connect("leave-event", Lang.bind(this, this._onLEntered));

	},

	_handleWindowList: function() {
		if (this.pref_button_to_open_menu === "winlistmenu1")
			this.pref_left_click_action = "none";
		if (this.pref_button_to_open_menu === "winlistmenu2")
			this.pref_middle_click_action = "none";
		if (!this.pref_windows_list_menu_enabled)
			this.pref_button_to_open_menu = "winlistmenu3";

		if (this._winMenu) {
			try {
				this._winMenu.disconnect(this.openAct);
			} catch (aErr) {}
		}

		if (!this.pref_windows_list_menu_enabled)
			return true;

		if (this.pref_button_to_open_menu === "winlistmenu3") // Right click
			this._winMenu = this._applet_context_menu;
		else { // Left or Middle click
			this.menuManager = new PopupMenu.PopupMenuManager(this);
			this._winMenu = new Applet.AppletPopupMenu(this, this._orientation, this._instance_id);
			this.menuManager.addMenu(this._winMenu);
		}

		try {
			this.openAct = this._winMenu.connect("open-state-changed", Lang.bind(this, this._onToggled));
		} catch (aErr) {}

	},

	updateMenu: function() {
		let allwins = [];
		this._winMenu.removeAll();
		let empty_menu = true;
		try {
			let tracker = Cinnamon.WindowTracker.get_default();
			for (let wks = 0; wks < global.screen.n_workspaces; ++wks) {
				// construct a list with all windows
				let workspace_name = Main.getWorkspaceName(wks);
				let metaWorkspace = global.screen.get_workspace_by_index(wks);
				let windows = metaWorkspace.list_windows();
				let sticky_windows = windows.filter(
					function(w) {
						return !w.is_skip_taskbar() && w.is_on_all_workspaces();
					});
				windows = windows.filter(
					function(w) {
						return !w.is_skip_taskbar() && !w.is_on_all_workspaces();
					});

				if (sticky_windows.length && (wks === 0)) {
					for (let i = 0; i < sticky_windows.length; ++i) {
						let metaWindow = sticky_windows[i];
						let TL_Dot = '...';
						if (metaWindow.get_title().length < 69) {
							TL_Dot = "";
						}
						let app = tracker.get_window_app(metaWindow);
						let icon = app.create_icon_texture(14);
						let item = new MenuItem(metaWindow.get_title().substring(0, 68) + TL_Dot, icon,
							Lang.bind(this, function() {
								this.activateWindow(metaWorkspace, metaWindow);
							}));
						if (this.pref_show_close_buttons) {
							let close_icon = new St.Icon({
								icon_name: 'window-close',
								icon_type: St.IconType.SYMBOLIC,
								style_class: 'popup-menu-icon'
							});
							let close_button = new St.Button({
								child: close_icon
							});
							close_button.connect('clicked', Lang.bind(this, function() {
								item.destroy();
								delete allwins[allwins.indexOf(metaWindow)];
								metaWindow.delete(global.get_current_time());
								if (this.pref_keep_menu_open) {
									this.uptgg = false;
									this._winMenu.toggle();
								}
							}));
							close_button.connect('enter-event', Lang.bind(this, Lang.bind(this, function() {
								let _children = item.actor.get_children();
								_children[_children.length - 1].set_style_class_name('popup-menu-icon');
								_children[_children.length - 1].add_style_class_name('popup-inactive-menu-item');
							})));
							close_button.connect('leave-event', Lang.bind(this, Lang.bind(this, function() {
								let _children = item.actor.get_children();
								_children[_children.length - 1].set_style_class_name('popup-menu-icon');
							})));
							item.addActor(close_button, {
								align: St.Align.END
							});
							allwins.push(sticky_windows[i]);
						}
						this._winMenu.addMenuItem(item);
					}
					empty_menu = false;
					if (windows.length)
						this._winMenu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
				}

				if (windows.length) {
					if (wks > 0) {
						this._winMenu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
					}
					if (global.screen.n_workspaces > 1) {
						let item = new PopupMenu.PopupMenuItem(workspace_name);
						item.actor.reactive = false;
						item.actor.can_focus = false;
						item.label.add_style_class_name('popup-subtitle-menu-item');
						if (wks == global.screen.get_active_workspace().index()) {
							item.setShowDot(true);
						}

						if (this.pref_show_close_buttons && this.pref_show_close_all_buttons) {
							let close_icon = new St.Icon({
								icon_name: Gtk.STOCK_DELETE,
								icon_type: St.IconType.FULLCOLOR,
								style: 'icon-size: 0.85em;'
							});
							let close_button = new St.Button({
								child: close_icon
							});
							close_button.connect('clicked', Lang.bind(this, function() {
								let items = this._winMenu._getMenuItems();
								for (let ii = items.indexOf(item); ii < items.length; ii++) {
									if (items[ii] instanceof PopupMenu.PopupSeparatorMenuItem)
										break;
									items[ii].destroy();
								}
								for (let wi = 0; wi < windows.length; wi++) {
									if (windows[wi]) {
										windows[wi].delete(global.get_current_time());
										delete allwins[allwins.indexOf(windows[wi])];
									}
								}
								if (this._winMenu.isOpen) {
									this._winMenu.toggle();
								}
								if (this.pref_keep_menu_open) {
									this.uptgg = false;
									this._winMenu.toggle();
								}
							}));
							close_button.connect('enter-event', Lang.bind(this, Lang.bind(this, function() {
								let _children = item.actor.get_children();
								_children[_children.length - 1].get_children()[0].style = "icon-size: 1em;";
							})));
							close_button.connect('leave-event', Lang.bind(this, Lang.bind(this, function() {
								let _children = item.actor.get_children();
								_children[_children.length - 1].get_children()[0].style = "icon-size: 0.85em;";
							})));
							item.addActor(close_button, {
								align: St.Align.MIDDLE
							});
						}

						this._winMenu.addMenuItem(item);
						empty_menu = false;
					}

					for (let i = 0; i < windows.length; ++i) {
						let metaWindow = windows[i];
						let TL_Dot = '...';
						if (metaWindow.get_title().length < 69) {
							TL_Dot = "";
						}
						let app = tracker.get_window_app(metaWindow);
						let icon = app.create_icon_texture(14);
						let item = new MenuItem(metaWindow.get_title().substring(0, 68) + TL_Dot, icon,
							Lang.bind(this, function() {
								this.activateWindow(metaWorkspace, metaWindow);
							}));

						if (this.pref_show_close_buttons) {
							let close_icon = new St.Icon({
								icon_name: 'window-close',
								icon_type: St.IconType.SYMBOLIC,
								style_class: 'popup-menu-icon'
							});
							let close_button = new St.Button({
								child: close_icon
							});
							close_button.connect('clicked', Lang.bind(this, function() {
								let items = this._winMenu._getMenuItems();
								let ii = items.indexOf(item);
								if (items[ii + 1] instanceof PopupMenu.PopupSeparatorMenuItem && (ii < 2 || items[ii - 2] instanceof PopupMenu.PopupSeparatorMenuItem))
									items[ii - 1].destroy();
								item.destroy();
								delete allwins[allwins.indexOf(metaWindow)];
								delete windows[windows.indexOf(metaWindow)];
								metaWindow.delete(global.get_current_time());
								if (this.pref_keep_menu_open) {
									this.uptgg = false;
									this._winMenu.toggle();
								}
							}));
							close_button.connect('enter-event', Lang.bind(this, Lang.bind(this, function() {
								let _children = item.actor.get_children();
								_children[_children.length - 1].set_style_class_name('popup-menu-icon');
								_children[_children.length - 1].add_style_class_name('popup-inactive-menu-item');
							})));
							close_button.connect('leave-event', Lang.bind(this, Lang.bind(this, function() {
								let _children = item.actor.get_children();
								_children[_children.length - 1].set_style_class_name('popup-menu-icon');
							})));
							item.addActor(close_button, {
								align: St.Align.END
							});
							allwins.push(windows[i]);
						}

						this._winMenu.addMenuItem(item);
						empty_menu = false;
					}
				}
			}
		} catch (e) {
			global.logError(e);
		}
		if (empty_menu) {
			let item = new PopupMenu.PopupMenuItem(_("No open windows"));
			item.actor.reactive = false;
			item.actor.can_focus = false;
			item.label.add_style_class_name('popup-subtitle-menu-item');
			this._winMenu.addMenuItem(item);
		}
		this._winMenu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		let icon = new St.Icon({
			icon_name: 'cinnamon-expo-symbolic',
			icon_type: St.IconType.SYMBOLIC,
			icon_size: 14
		});
		let item = new MenuItem(_("Expo                  "), icon, Lang.bind(this, function() {
			if (!Main.expo.animationInProgress)
				Main.expo.toggle();
		}));
		if (allwins.length > 0 && this.pref_show_close_buttons && this.pref_show_close_all_buttons) {
			let close_icon = new St.Icon({
				icon_name: Gtk.STOCK_DELETE,
				icon_type: St.IconType.FULLCOLOR,
				style: 'icon-size: 0.8em;'
			});
			let close_button = new St.Button({
				child: close_icon
			});
			close_button.connect('clicked', Lang.bind(this, function() {
				for (let wi = 0; wi < allwins.length; wi++) {
					if (allwins[wi])
						allwins[wi].delete(global.get_current_time());
				}
				this._winMenu.toggle();
			}));
			close_button.connect('enter-event', Lang.bind(this, Lang.bind(this, function() {
				let _children = item.actor.get_children();
				_children[_children.length - 1].get_children()[0].style = "icon-size: 1em;";
			})));
			close_button.connect('leave-event', Lang.bind(this, Lang.bind(this, function() {
				let _children = item.actor.get_children();
				_children[_children.length - 1].get_children()[0].style = "icon-size: 0.8em;";
			})));
			item.addActor(close_button, {
				align: St.Align.MIDDLE
			});
		}

		this._winMenu.addMenuItem(item);

		if (this.pref_show_context_menu_default_items) {
			if (this.pref_button_to_open_menu === "winlistmenu3")
				this.addDefaultContextItems();
			else
				this.addDefaultContextItems(true);
		}
	},

	addDefaultContextItems: function(aRestore) {
		if (aRestore)
			this._applet_context_menu.removeAll();
		let addSeparator = 0;
		if (this.pref_show_context_menu_about)
			addSeparator += 1;
		if (this.pref_show_context_menu_configure)
			addSeparator += 1;
		if (this.pref_show_context_menu_remove)
			addSeparator += 1;

		if (!aRestore && addSeparator !== 0) {
			this.context_menu_separator = new PopupMenu.PopupSeparatorMenuItem();
			this._applet_context_menu.addMenuItem(this.context_menu_separator);
		}

		if (this.pref_show_context_menu_about || aRestore) {
			this.context_menu_item_about = new PopupMenu.PopupIconMenuItem(_("About..."),
				"dialog-question",
				St.IconType.SYMBOLIC);
			this.context_menu_item_about.connect('activate', Lang.bind(this, this.openAbout));
			this._applet_context_menu.addMenuItem(this.context_menu_item_about);
		}

		if (this.pref_show_context_menu_configure || aRestore) {
			this.context_menu_item_configure = new PopupMenu.PopupIconMenuItem(_("Configure..."),
				"system-run",
				St.IconType.SYMBOLIC);
			this.context_menu_item_configure.connect('activate', Lang.bind(this, function() {
				Util.spawnCommandLine("cinnamon-settings applets " + this._uuid + " " + this.instance_id);
			}));
			this._applet_context_menu.addMenuItem(this.context_menu_item_configure);
		}

		if (this.pref_show_context_menu_remove || aRestore) {
			this.context_menu_item_remove = new PopupMenu.PopupIconMenuItem(_("Remove this applet"),
				"edit-delete",
				St.IconType.SYMBOLIC);
			this.context_menu_item_remove.connect('activate', Lang.bind(this, function() {
				AppletManager._removeAppletFromPanel(this._uuid, this.instance_id);
			}));
			this._applet_context_menu.addMenuItem(this.context_menu_item_remove);
		}
	},

	activateWindow: function(metaWorkspace, metaWindow) {
		if (!metaWindow.is_on_all_workspaces())
			metaWorkspace.activate(global.get_current_time());
		metaWindow.unminimize(global.get_current_time());
		metaWindow.activate(global.get_current_time());
	},

	_onToggled: function(actor, isOpening) {
		if (isOpening) {
			if (this.uptgg)
				this.updateMenu();
			else if (this._winMenu._getMenuItems()[0] instanceof PopupMenu.PopupSeparatorMenuItem &&
				(this._winMenu._getMenuItems().length < 3 ||
					(this._winMenu._getMenuItems().length < 4 && this._winMenu._getMenuItems()[1] instanceof PopupMenu.PopupSeparatorMenuItem) || (this._winMenu._getMenuItems().length < 5 &&
						this._winMenu._getMenuItems()[1] instanceof PopupMenu.PopupSeparatorMenuItem &&
						this._winMenu._getMenuItems()[2] instanceof PopupMenu.PopupSeparatorMenuItem)
				)
			)
				this._winMenu.toggle();
		}
		this.uptgg = true;
	},

	show_all: function(time) {
		let windows = global.get_window_actors();
		for (let i = 0; i < windows.length; i++) {
			let window = windows[i].meta_window;
			let compositor = windows[i];
			if (window.get_title() == "Desktop") {
				Tweener.addTween(compositor, {
					opacity: 255,
					time: time,
					transition: "easeOutSine"
				});
			}
			if (this.pref_blur_effect_enabled && compositor.eff) {
				compositor.remove_effect(compositor.eff);
			}
		}
		Tweener.addTween(global.window_group, {
			opacity: 255,
			time: time,
			transition: "easeOutSine"
		});
		Tweener.addTween(Main.deskletContainer.actor, {
			opacity: 255,
			time: time,
			transition: "easeOutSine"
		});
	},

	_onEntered: function(event) {
		if (this.pref_peek_desktop_enabled) {
			if (this._peektimeoutid)
				Mainloop.source_remove(this._peektimeoutid);

			this._peektimeoutid = Mainloop.timeout_add(this.pref_peek_desktop_delay, Lang.bind(this, function() {
				if (this.actor.hover && !this._applet_context_menu.isOpen && !global.settings.get_boolean("panel-edit-mode")) {

					Tweener.addTween(global.window_group, {
						opacity: this.pref_peek_opacity,
						time: 0.275,
						transition: "easeInSine"
					});

					let windows = global.get_window_actors();
					for (let i = 0; i < windows.length; i++) {
						let window = windows[i].meta_window;
						let compositor = windows[i];
						if (window.get_title() == "Desktop") {
							if (this.pref_opacify_desktop_icons)
								Tweener.addTween(compositor, {
									opacity: this.pref_peek_opacity,
									time: 0.275,
									transition: "easeInSine"
								});
							else
								continue;
							//break;
						}

						if (this.pref_blur_effect_enabled) {
							if (!compositor.eff)
								compositor.eff = new Clutter.BlurEffect();
							compositor.add_effect_with_name('blur', compositor.eff);
						}
					}

					if (this.pref_opacify_desklets) {
						Tweener.addTween(Main.deskletContainer.actor, {
							opacity: this.pref_peek_opacity,
							time: 0.275,
							transition: "easeInSine"
						});
					}
					this.didpeek = true;
				}

			}));
		}
	},

	_onLEntered: function(event) {
		if (this.didpeek) {
			this.show_all(0.2);
			this.didpeek = false;
		}
		if (this._peektimeoutid)
			Mainloop.source_remove(this._peektimeoutid);
	},

	_setAppletStyle: function(aInit) {
		this.actor.style = "background-color:" + this.pref_applet_background_color + ";";

		if (aInit)
			return true;

		// If I use this.actor.style to set the applet width, it will not apply the width
		// when the applet is loaded. ¬¬
		if (this.pref_applet_with !== 0)
			this.actor.set_width(this.pref_applet_with);

		// Set icon block extracted from default Cinnamon Menu applet.
		try {
			if (this.pref_custom_icon === "") {
				this.set_applet_icon_name("");
				this.hide_applet_icon();
			} else if (GLib.path_is_absolute(this.pref_custom_icon) &&
				GLib.file_test(this.pref_custom_icon, GLib.FileTest.EXISTS)) {
				if (this.pref_custom_icon.search("-symbolic") !== -1)
					this.set_applet_icon_symbolic_path(this.pref_custom_icon);
				else
					this.set_applet_icon_path(this.pref_custom_icon);
			} else if (Gtk.IconTheme.get_default().has_icon(this.pref_custom_icon)) {
				if (this.pref_custom_icon.search("-symbolic") !== -1)
					this.set_applet_icon_symbolic_name(this.pref_custom_icon);
				else
					this.set_applet_icon_name(this.pref_custom_icon);
			}
		} catch (e) {
			global.logWarning("Could not load icon file \"" + this.pref_custom_icon + "\" for applet.");
		}

		this._setAppletTooltip();
	},

	_strMap: {
		"expo": "Expo",
		"overview": "Overview",
		"appswitcher": "Launch App Switcher",
		"cc1": "Run 1st Custom Command",
		"cc2": "Run 2nd Custom Command",
		"cc3": "Run 3rd Custom Command",
		"cc4": "Run 4rd Custom Command",
		"none": "None",
		"icons": "Icons only",
		"thumbnails": "Thumbnails only",
		"icons+thumbnails": "Icons and thumbnails",
		"icons+preview": "Icons and window preview",
		"preview": "Window preview (no icons)",
		"coverflow": "Coverflow (3D)",
		"timeline": "Timeline (3D)",
		"default": "System default",
		"switch_workspace": "Switch between workspaces",
		"adjust_opacity": "Adjust opacity of windows",
		"desktop": "Toggle show desktop",
		"switch-windows": "Switch between windows",
		"winmenu": "Open windows list menu",
	},

	_setAppletTooltip: function() {
		if (this.tooltip)
			this.tooltip.destroy();

		let boldSpan = function(aStr) {
			return '<span weight="bold">' + aStr + '</span>';
		};

		let tt = boldSpan(_("Desktop Handler Applet")) + "\n\n";

		if (this.pref_separated_scroll_action) {
			tt += boldSpan(_("Scroll Up action: ")) + _(this._strMap[this.pref_scroll_up_action]) + "\n";
			tt += boldSpan(_("Scroll Down action: ")) + _(this._strMap[this.pref_scroll_down_action]) + "\n";
		} else
			tt += boldSpan(_("Scroll action: ")) + _(this._strMap[this.pref_scroll_action]) + "\n";

		let lCA = (this.pref_windows_list_menu_enabled &&
				this.pref_button_to_open_menu === "winlistmenu1") ?
			this._strMap["winmenu"] :
			this._strMap[this.pref_left_click_action];
		tt += boldSpan(_("Left click action: ")) + _(lCA) + "\n";

		let mCA = (this.pref_windows_list_menu_enabled &&
				this.pref_button_to_open_menu === "winlistmenu2") ?
			this._strMap["winmenu"] :
			this._strMap[this.pref_middle_click_action];
		tt += boldSpan(_("Middle click action: ")) + _(mCA) + "\n";

		if (this.pref_windows_list_menu_enabled &&
			this.pref_button_to_open_menu === "winlistmenu3")
			tt += boldSpan(_("Right click action: ")) + _(this._strMap["winmenu"]) + "\n";

		this.tooltip = new Tooltips.PanelItemTooltip(this, "", this._orientation);

		/* Some hacking of the underlying tooltip ClutterText to set wrapping,
		 * format, etc */
		try {
			this.tooltip._tooltip.style_class = "desktop-handler-applet-tooltip";
			// this.tooltip._tooltip.get_clutter_text().set_width(TOOLTIP_WIDTH);
			this.tooltip._tooltip.get_clutter_text().set_line_alignment(0);
			this.tooltip._tooltip.get_clutter_text().set_line_wrap(true);
			this.tooltip._tooltip.get_clutter_text().set_markup(tt);
		} catch (aErr) {
			global.logError("Error Tweaking Tooltip: " + aErr);
			/* If we couldn't tweak the tooltip format this is likely because
			 * the underlying implementation has changed. Don't issue any
			 * failure here */
		}

		// this.set_applet_tooltip(tt);
	},

	_onScrollActionChanged: function() {
		if (this.pref_scroll_action !== "none")
			this.pref_separated_scroll_action = false;
		this._setAppletTooltip();
	},

	_onScrollSettingsChanged: function() {
		if (this.pref_separated_scroll_action === true)
			this.pref_scroll_action = "none";
		this._setAppletTooltip();
	},

	_onButtonPressEvent: function(aActor, aE) {
		let button = aE.get_button();
		let open_menu = false;
		if (button === 1) {
			open_menu = this.pref_windows_list_menu_enabled &&
				this.pref_button_to_open_menu === "winlistmenu1";
			this.Do(open_menu ?
				this.pref_button_to_open_menu :
				this.pref_left_click_action);
		} else if (button === 2) {
			open_menu = this.pref_windows_list_menu_enabled &&
				this.pref_button_to_open_menu === "winlistmenu2";
			this.Do(open_menu ?
				this.pref_button_to_open_menu :
				this.pref_middle_click_action);
		}

		this.show_all(0);
		if (this._peektimeoutid)
			Mainloop.source_remove(this._peektimeoutid);
		this.didpeek = false;

		return Applet.Applet.prototype._onButtonPressEvent.call(this, aActor, aE);
	},

	_onScroll: function(aActor, aE) {
		let currentTime = Date.now();
		let direction = aE.get_scroll_direction();
		if (this.pref_separated_scroll_action) {
			if (direction == Clutter.ScrollDirection.UP)
				this.Do(this.pref_scroll_up_action);
			else if (direction == Clutter.ScrollDirection.DOWN)
				this.Do(this.pref_scroll_down_action);
		} else {
			let scrollDirection;
			switch (direction) {
				case Clutter.ScrollDirection.UP:
					scrollDirection = 1;
					break;
				case Clutter.ScrollDirection.DOWN:
					scrollDirection = -1;
					break;
				default:
					return Clutter.EVENT_PROPAGATE;
			}
			if (this.pref_scroll_action === "adjust_opacity") { // Tested OK
				let min_opacity = this.cwm_settings.get_int("min-window-opacity") * 255 / 100;
				let m = 50;
				m = global.window_group.opacity + m * scrollDirection;
				if (m < min_opacity)
					m = min_opacity;
				if (m > 255)
					m = 255;
				global.window_group.opacity = m;
			} else if (this.pref_scroll_action === "desktop") { // Tested OK
				if (Main.panel.bottomPosition)
					scrollDirection = -scrollDirection;
				if (scrollDirection === 1)
					GLib.spawn_command_line_async("wmctrl -k on");
				else if (scrollDirection === -1)
					GLib.spawn_command_line_async("wmctrl -k off");
			} else {
				let limit = this._lastScroll + this.pref_scroll_delay;
				if (this.pref_prevent_fast_scroll &&
					currentTime < limit &&
					currentTime >= this._lastScroll) {
					//
				} else if (this.pref_scroll_action === "switch_workspace") {
					if (ExtensionSystem.runningExtensions["Flipper@connerdev"]) {
						if (!this.Flipper)
							this.Flipper = ExtensionSystem.extensions["Flipper@connerdev"]["extension"];
						let binding = [];
						binding.get_mask = function() {
							return 0x0;
						};
						if (scrollDirection === 1)
							binding.get_name = function() {
								return "switch-to-workspace-left";
							};
						else if (scrollDirection == -1)
							binding.get_name = function() {
								return "switch-to-workspace-right";
							};
						let flipper = new this.Flipper.Flipper(null, null, null, binding);
						if (flipper.is_animating) {
							flipper.destroy_requested = true;
						} else {
							flipper.destroy_requested = true;
							flipper.onDestroy();
						}
					} else {
						let activeWsIndex = global.screen.get_active_workspace_index();
						let reqWsInex = activeWsIndex - scrollDirection;
						let last = global.screen.get_n_workspaces() - 1;
						let first = 0;
						let flast = last;
						if (this.muf_settings.get_boolean("workspace-cycle")) {
							first = last;
							flast = 0;
						}
						if (reqWsInex < 0)
							reqWsInex = first;
						else if (reqWsInex > last)
							reqWsInex = flast;
						let reqWs = global.screen.get_workspace_by_index(reqWsInex);
						reqWs.activate(global.get_current_time());
						this.showWorkspaceOSD();
					}
				} else if (this.pref_scroll_action === "switch-windows") {
					let current = 0;
					let vis_windows = [];
					this.window_list = global.screen.get_active_workspace().list_windows();
					let v = 0,
						vLen = this.window_list.length;
					for (; v < vLen; v++) {
						if (!this.window_list[v].is_skip_taskbar())
							vis_windows.push(v);
					}
					let n = 0;
					let num_windows = vis_windows.length;
					for (; n < num_windows; n++) {
						if (this.window_list[vis_windows[n]].has_focus()) {
							current = n;
							break;
						}
					}
					let target = current - scrollDirection;
					if (target < 0)
						target = num_windows - 1;
					if (target > num_windows - 1)
						target = 0;
					Main.activateWindow(this.window_list[vis_windows[target]],
						global.get_current_time());
				}
			}
		}
		this._lastScroll = currentTime;
		return true;
	},

	Do: function(aAction) {
		let activeWs = 0,
			reqWs = 0;
		switch (aAction) {
			case "winlistmenu1":
			case "winlistmenu2":
				this._winMenu.toggle();
				break;
			case "expo":
				if (!Main.expo.animationInProgress)
					Main.expo.toggle();
				break;
			case "overview":
				if (!Main.overview.animationInProgress)
					Main.overview.toggle();
				break;
			case "desktop":
				let currentTime = Date.now();
				if (currentTime < this.last_sd_req + this.scroll_delay &&
					currentTime > this.last_sd_req) {
					this.last_sd_req = currentTime;
					return true;
				}
				global.screen.toggle_desktop(global.get_current_time());
				this.last_sd_req = currentTime;
				break;
			case "cc1":
				Util.spawnCommandLine(this.pref_custom_cmd1_action);
				break;
			case "cc2":
				Util.spawnCommandLine(this.pref_custom_cmd2_action);
				break;
			case "cc3":
				Util.spawnCommandLine(this.pref_custom_cmd3_action);
				break;
			case "cc4":
				Util.spawnCommandLine(this.pref_custom_cmd4_action);
				break;
			case "leftWS":
				activeWs = global.screen.get_active_workspace();
				reqWs = activeWs.get_neighbor(Meta.MotionDirection.LEFT);
				break;
			case "rightWS":
				activeWs = global.screen.get_active_workspace();
				reqWs = activeWs.get_neighbor(Meta.MotionDirection.RIGHT);
				break;
			case "firstWS":
				reqWs = global.screen.get_workspace_by_index(0);
				break;
			case "lastWS":
				let n = global.screen.get_n_workspaces() - 1;
				reqWs = global.screen.get_workspace_by_index(n);
				break;
			case "appswitcher":
				this.get_name = Lang.bind(this, function() {
					if (eval(this.pref_switcher_modifier) & global.get_pointer()[2])
						return this.pref_switcher_modified;
					else
						return this.pref_switcher_scope;
				});
				this.get_mask = function() {
					return 0xFFFF;
				};
				let style = this.pref_switcher_style;
				if (style === "default")
					style = global.settings.get_string("alttab-switcher-style");
				if (style === "coverflow") {
					if (!this._switcherIsRuning)
						new myCoverflowSwitcher(this);
					this._switcherIsRuning = true;
					let delay = global.settings.get_int("alttab-switcher-delay");
					Mainloop.timeout_add(delay, Lang.bind(this, function() {
						this._switcherIsRuning = false;
					}));
				} else if (style === "timeline") {
					if (!this._switcherIsRuning)
						new myTimelineSwitcher(this);
					this._switcherIsRuning = true;
					let delay = global.settings.get_int("alttab-switcher-delay");
					Mainloop.timeout_add(delay, Lang.bind(this, function() {
						this._switcherIsRuning = false;
					}));
				} else {
					new myClassicSwitcher(this);
				}

				break;
		}
		if (reqWs) {
			reqWs.activate(global.get_current_time());
			this.showWorkspaceOSD();
		}
	},

	showWorkspaceOSD: function() {
		this._hideWorkspaceOSD();
		if (global.settings.get_boolean("workspace-osd-visible")) {
			let current_workspace_index = global.screen.get_active_workspace_index();
			let monitor = Main.layoutManager.primaryMonitor;
			if (this._workspace_osd === null)
				this._workspace_osd = new St.Label({
					style_class: "workspace-osd"
				});
			this._workspace_osd.set_text(Main.getWorkspaceName(current_workspace_index));
			this._workspace_osd.set_opacity = 0;
			Main.layoutManager.addChrome(this._workspace_osd, {
				visibleInFullscreen: false,
				affectsInputRegion: false
			});
			let workspace_osd_x = global.settings.get_int("workspace-osd-x");
			let workspace_osd_y = global.settings.get_int("workspace-osd-y");
			/*
			 * This aligns the osd edges to the minimum/maximum values from gsettings,
			 *
			 * if those are selected to be used. For values in between minimum/maximum,
			 * it shifts the osd by half of the percentage used of the overall space available
			 * for display (100% - (left and right "padding")).
			 * The horizontal minimum/maximum values are 5% and 95%, resulting in 90% available for
			 *  positioning
			 * If the user chooses 50% as osd position, these calculations result the osd being
			 *  centered onscreen
			 */
			let [minX, maxX, minY, maxY] = [5, 95, 5, 95];
			let delta = (workspace_osd_x - minX) / (maxX - minX);
			let x = Math.round((monitor.width * workspace_osd_x / 100) -
				(this._workspace_osd.width * delta));
			delta = (workspace_osd_y - minY) / (maxY - minY);
			let y = Math.round((monitor.height * workspace_osd_y / 100) -
				(this._workspace_osd.height * delta));
			this._workspace_osd.set_position(x, y);
			let duration = global.settings.get_int("workspace-osd-duration") / 1000;
			Tweener.addTween(this._workspace_osd, {
				opacity: 255,
				time: duration,
				transition: "linear",
				onComplete: this._fadeWorkspaceOSD,
				onCompleteScope: this
			});
		}
	},

	_fadeWorkspaceOSD: function() {
		if (this._workspace_osd !== null) {
			let duration = global.settings.get_int("workspace-osd-duration") / 2000;
			Tweener.addTween(this._workspace_osd, {
				opacity: 0,
				time: duration,
				transition: "easeOutExpo",
				onComplete: this._hideWorkspaceOSD,
				onCompleteScope: this
			});
		}
	},

	_hideWorkspaceOSD: function() {
		if (this._workspace_osd !== null) {
			this._workspace_osd.hide();
			Main.layoutManager.removeChrome(this._workspace_osd);
			this._workspace_osd.destroy();
			this._workspace_osd = null;
		}
	},

	checkEventSource: function(aActor, aE) {
		let source = aE.get_source();
		let not_ours = (source !== aActor);
		return not_ours;
	},

	_notifyme: function(aMsg) {
		GLib.spawn_command_line_async("notify-send --icon=image-missing '" + aMsg + "'");
	},

	on_applet_removed_from_panel: function() {
		this.settings.finalize();
	},
};

function myClassicSwitcher() {
	this._init.apply(this, arguments);
}

myClassicSwitcher.prototype = {
	__proto__: ClassicSwitcher.ClassicSwitcher.prototype,

	_init: function() {
		AppSwitcher.AppSwitcher.prototype._init.apply(this, arguments);

		this.actor = new Cinnamon.GenericContainer({
			name: "altTabPopup",
			reactive: true,
			visible: false
		});

		this._thumbnailTimeoutId = 0;
		this.thumbnailsVisible = false;
		this._displayPreviewTimeoutId = 0;

		Main.uiGroup.add_actor(this.actor);

		if (!this._setupModal())
			return true;

		let styleSettings = this._binding.pref_switcher_style;
		if (styleSettings == 'default')
			styleSettings = global.settings.get_string("alttab-switcher-style");
		let features = styleSettings.split("+");
		this._iconsEnabled = features.indexOf("icons") !== -1;
		this._previewEnabled = features.indexOf("preview") !== -1;
		this._thumbnailsEnabled = features.indexOf("thumbnails") !== -1;
		if (!this._iconsEnabled && !this._previewEnabled && !this._thumbnailsEnabled)
			this._iconsEnabled = true;

		this._showThumbnails = this._thumbnailsEnabled && !this._iconsEnabled;
		this._showArrows = this._thumbnailsEnabled && this._iconsEnabled;

		this._updateList(0);

		this.actor.connect("get-preferred-width", Lang.bind(this, this._getPreferredWidth));
		this.actor.connect("get-preferred-height", Lang.bind(this, this._getPreferredHeight));
		this.actor.connect("allocate", Lang.bind(this, this._allocate));

		// Need to force an allocation so we can figure out whether we
		// need to scroll when selecting
		this.actor.opacity = 0;
		this.actor.show();
		this.actor.get_allocation_box();
	},

	_setupModal: function() {
		this._haveModal = Main.pushModal(this.actor);
		if (!this._haveModal)
			this._activateSelected();
		else {
			this._disableHover();

			this.actor.connect("key-press-event", Lang.bind(this, this._keyPressEvent));
			this.actor.connect("key-release-event", Lang.bind(this, this._keyReleaseEvent));
			this.actor.connect("scroll-event", Lang.bind(this, this._scrollEvent));
			this.actor.connect("button-press-event", Lang.bind(this, this.owndestroy));
			let delay = global.settings.get_int("alttab-switcher-delay");
			this._initialDelayTimeoutId = Mainloop.timeout_add(delay, Lang.bind(this, this._show));
			this._currentIndex--;
		}
		return this._haveModal;
	},

	_keyReleaseEvent: function(actor, event) {
		let key = event.get_key_symbol();
		if (key == Clutter.KEY_Right || key == Clutter.KEY_Left) return true;
		if (this._initialDelayTimeoutId !== 0)
			this._currentIndex = (this._currentIndex + 1) % this._windows.length;
		this._activateSelected();
		return true;
	},

	owndestroy: function() {
		this._activateSelected();
	},
};

function myTimelineSwitcher() {
	this._init.apply(this, arguments);
}

myTimelineSwitcher.prototype = {
	__proto__: TimelineSwitcher.TimelineSwitcher.prototype,

	_init: function() {
		TimelineSwitcher.TimelineSwitcher.prototype._init.apply(this, arguments);
	},

	_setupModal: function() {
		this._haveModal = Main.pushModal(this.actor);
		if (!this._haveModal)
			this._activateSelected();
		else {
			this._disableHover();

			this.actor.connect("key-press-event", Lang.bind(this, this._keyPressEvent));
			this.actor.connect("key-release-event", Lang.bind(this, this._keyReleaseEvent));
			this.actor.connect("scroll-event", Lang.bind(this, this._scrollEvent));
			this.actor.connect("button-press-event", Lang.bind(this, this.owndestroy));
			let delay = global.settings.get_int("alttab-switcher-delay");
			this._initialDelayTimeoutId = Mainloop.timeout_add(delay, Lang.bind(this, this._show));
			this._currentIndex--;
		}
		return this._haveModal;
	},

	_keyReleaseEvent: function(actor, event) {
		let key = event.get_key_symbol();
		if (key == Clutter.KEY_Right || key == Clutter.KEY_Left) return true;
		if (this._initialDelayTimeoutId !== 0)
			this._currentIndex = (this._currentIndex + 1) % this._windows.length;
		this._activateSelected();
		return true;
	},

	owndestroy: function() {
		this._activateSelected();
	},
};

function myCoverflowSwitcher() {
	this._init.apply(this, arguments);
}

myCoverflowSwitcher.prototype = {
	__proto__: CoverflowSwitcher.CoverflowSwitcher.prototype,

	_init: function() {
		CoverflowSwitcher.CoverflowSwitcher.prototype._init.apply(this, arguments);
	},

	_setupModal: function() {
		this._haveModal = Main.pushModal(this.actor);
		if (!this._haveModal)
			this._activateSelected();
		else {
			this._disableHover();

			this.actor.connect("key-press-event", Lang.bind(this, this._keyPressEvent));
			this.actor.connect("key-release-event", Lang.bind(this, this._keyReleaseEvent));
			this.actor.connect("scroll-event", Lang.bind(this, this._scrollEvent));
			this.actor.connect("button-press-event", Lang.bind(this, this.owndestroy));
			let delay = global.settings.get_int("alttab-switcher-delay");
			this._initialDelayTimeoutId = Mainloop.timeout_add(delay, Lang.bind(this, this._show));
			this._currentIndex--;
		}
		return this._haveModal;
	},

	_keyReleaseEvent: function(actor, event) {
		let key = event.get_key_symbol();
		if (key == Clutter.KEY_Right || key == Clutter.KEY_Left) return true;
		if (this._initialDelayTimeoutId !== 0)
			this._currentIndex = (this._currentIndex + 1) % this._windows.length;
		this._activateSelected();
		return true;
	},

	owndestroy: function() {
		this._activateSelected();
	},

};

function main(aMetadata, aOrientation, aPanel_height, aInstance_id) {
	let myApplet = new MyApplet(aMetadata, aOrientation, aPanel_height, aInstance_id);
	return myApplet;
}