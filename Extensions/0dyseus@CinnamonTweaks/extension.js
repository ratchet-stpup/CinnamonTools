const Lang = imports.lang;
const Settings = imports.ui.settings;
const Main = imports.ui.main;
const AppletManager = imports.ui.appletManager;
const DeskletManager = imports.ui.deskletManager;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext;
const Extension = imports.ui.extension;
const Cinnamon = imports.gi.Cinnamon;

let UUID,
	ConfirmationDialog,
	settings,
	metadata,
	allowEnabling = false;

function _(aStr) {
	let customTrans = Gettext.dgettext(UUID, aStr);
	if (customTrans != aStr) {
		return customTrans;
	}
	return Gettext.gettext(aStr);
}

var IDS = {
	MTP: 0, // CT_MessageTrayPatch toggle ID.
	DMP: 0, // CT_DeskletManagerPatch toggle ID.
	AMP: 0, // CT_AppletManagerPatch toogle ID.
	WDAE: 0, // CT_WindowDemandsAttentionBehavior toogle ID.
	EXEC_WDAE: 0, // CT_WindowDemandsAttentionBehavior execution ID.
	CONNECTION_WDAE: 0, // CT_WindowDemandsAttentionBehavior connection ID.
};

/*
 * Container for old attributes and functions for later restore.
 */
let Storage = {
	messageTray: {},
	appletmanager: {},
	deskletManager: {}
};

var CT_AppletManagerPatch = {
	enable: function() {
		let am = AppletManager;

		// Extracted from /usr/share/cinnamon/js/ui/appletManager.js
		// Patch Appletmanager._removeAppletFromPanel to ask for confirmation on applet removal.
		Storage.appletmanager._removeAppletFromPanel = am._removeAppletFromPanel;
		am._removeAppletFromPanel = function(uuid, applet_id) {
			let removeApplet = function() {
				try {
					let enabledApplets = am.enabledAppletDefinitions.raw;
					for (let i = 0; i < enabledApplets.length; i++) {
						let appletDefinition = am.getAppletDefinition(enabledApplets[i]);
						if (appletDefinition) {
							if (uuid == appletDefinition.uuid && applet_id == appletDefinition.applet_id) {
								let newEnabledApplets = enabledApplets.slice(0);
								newEnabledApplets.splice(i, 1);
								global.settings.set_strv('enabled-applets', newEnabledApplets);
								break;
							}
						}
					}
				} catch (aErr) {
					global.logError(aErr.message);
				}
			};
			let ctrlKey = Clutter.ModifierType.CONTROL_MASK & global.get_pointer()[2];

			if (ctrlKey)
				removeApplet();
			else
				new ConfirmationDialog(function() {
						removeApplet();
					},
					"Applet removal",
					_("Do you want to remove '%s' from your panel?\nInstance ID: %s")
					.format(AppletManager.get_object_for_uuid(uuid, applet_id)._meta.name, applet_id),
					_("OK"),
					_("Cancel")).open();
		};
	},

	disable: function() {
		if (Storage.appletmanager._removeAppletFromPanel) {
			AppletManager._removeAppletFromPanel = Storage.appletmanager._removeAppletFromPanel;
			delete Storage.appletmanager._removeAppletFromPanel;
		}
	},

	toggle: function() {
		togglePatch(CT_AppletManagerPatch, "AMP", settings.pref_ask_confirmation_applet_removal);
	}
};

var CT_DeskletManagerPatch = {
	enable: function() {
		let dm = DeskletManager;

		// Extracted from /usr/share/cinnamon/js/ui/deskletManager.js
		// Patch DeskletManager.removeDesklet to ask for confirmation on desklet removal.
		Storage.deskletManager.removeDesklet = dm.removeDesklet;
		dm.removeDesklet = function(uuid, desklet_id) {
			let ENABLED_DESKLETS_KEY = "enabled-desklets";
			let removeDesklet = function() {
				try {
					let list = global.settings.get_strv(ENABLED_DESKLETS_KEY);
					for (let i = 0; i < list.length; i++) {
						let definition = list[i];
						let elements = definition.split(":");
						if (uuid == elements[0] && desklet_id == elements[1]) list.splice(i, 1);
					}
					global.settings.set_strv(ENABLED_DESKLETS_KEY, list);
				} catch (aErr) {
					global.logError(aErr.message);
				}
			};
			let ctrlKey = Clutter.ModifierType.CONTROL_MASK & global.get_pointer()[2];

			if (ctrlKey)
				removeDesklet();
			else
				new ConfirmationDialog(function() {
						removeDesklet();
					},
					"Desklet removal",
					_("Do you want to remove '%s' from your desktop?\nInstance ID: %s")
					.format(DeskletManager.get_object_for_uuid(uuid, desklet_id)._meta.name, desklet_id),
					_("OK"),
					_("Cancel")).open();
		};
	},

	disable: function() {
		if (Storage.deskletManager.removeDesklet) {
			DeskletManager.removeDesklet = Storage.deskletManager.removeDesklet;
			delete Storage.deskletManager.removeDesklet;
		}
	},

	toggle: function() {
		togglePatch(CT_DeskletManagerPatch, "DMP", settings.pref_ask_confirmation_desklet_removal);
	}
};

var CT_MessageTrayPatch = {
	enable: function() {
		let mt = Main.messageTray;
		let position = settings.pref_notifications_position; // true = bottom, false = top
		let distanceFromPanel = Number(settings.pref_notifications_distance_from_panel);
		let ANIMATION_TIME = settings.pref_notifications_enable_animation ? 0.2 : 0.001;
		let State = {
			HIDDEN: 0,
			SHOWING: 1,
			SHOWN: 2,
			HIDING: 3
		};

		// Extracted from /usr/share/cinnamon/js/ui/messageTray.js
		// Patch _hideNotification to allow correct animation.
		Storage.messageTray._hideNotification = mt._hideNotification;
		mt._hideNotification = function() {
			this._focusGrabber.ungrabFocus();
			if (this._notificationExpandedId) {
				this._notification.disconnect(this._notificationExpandedId);
				this._notificationExpandedId = 0;
			}

			this._tween(this._notificationBin, '_notificationState', State.HIDDEN, {
				y: (position ?
					Main.layoutManager.primaryMonitor.height :
					Main.layoutManager.primaryMonitor.y),
				opacity: 0,
				time: ANIMATION_TIME,
				transition: 'easeOutQuad',
				onComplete: this._hideNotificationCompleted,
				onCompleteScope: this
			});
		};

		// Patch _showNotification to allow correct animation and custom right margin.
		Storage.messageTray._showNotification = mt._showNotification;
		mt._showNotification = function() {
			this._notificationTimeoutId = 1;
			this._notification = this._notificationQueue.shift();
			if (this._notification.actor._parent_container) {
				this._notification.collapseCompleted();
				this._notification.actor._parent_container.remove_actor(this._notification.actor);
			}
			this._notificationClickedId = this._notification.connect('done-displaying',
				Lang.bind(this, this._escapeTray));
			this._notificationBin.child = this._notification.actor;
			this._notificationBin.opacity = 0;

			let monitor = Main.layoutManager.primaryMonitor;
			let panel = Main.panelManager.getPanel(0, position); // If Cinnamon 3.0.7 stable and older
			if (!panel)
				panel = Main.panelManager.getPanel(0, Number(position ? 1 : 0)); // If Cinnamon 3.0.7 nightly and newer(?)
			let height = 5;
			if (panel)
				height += panel.actor.get_height();
			this._notificationBin.y = position ?
				monitor.height - height / 2 :
				monitor.y + height * 2;

			let margin = this._notification._table.get_theme_node().get_length('margin-from-right-edge-of-screen');
			if (settings.pref_notifications_right_margin !== 0)
				margin = settings.pref_notifications_right_margin;
			this._notificationBin.x = monitor.x + monitor.width - this._notification._table.width - margin;
			Main.soundManager.play('notification');
			this._notificationBin.show();

			this._updateShowingNotification();

			let [x, y, mods] = global.get_pointer();
			this._showNotificationMouseX = x;
			this._showNotificationMouseY = y;
			this._lastSeenMouseY = y;
		};

		// Patch _onNotificationExpanded to allow correct showing animation and custom top/bottom margins.
		Storage.messageTray._onNotificationExpanded = mt._onNotificationExpanded;
		mt._onNotificationExpanded = function() {
			let expandedY = this._notification.actor.height - this._notificationBin.height;

			let monitor = Main.layoutManager.primaryMonitor;
			let panel = Main.panelManager.getPanel(0, position); // If Cinnamon 3.0.7 stable and older
			if (!panel)
				panel = Main.panelManager.getPanel(0, Number(position ? 1 : 0)); // If Cinnamon 3.0.7 nightly and newer(?)
			let height = 0;
			if (panel)
				height += panel.actor.get_height();
			let newY = position ?
				monitor.height - this._notificationBin.height - height - distanceFromPanel :
				monitor.y + height + distanceFromPanel;

			if (this._notificationBin.y < expandedY)
				this._notificationBin.y = expandedY;
			else if (this._notification.y != expandedY)
				this._tween(this._notificationBin, '_notificationState', State.SHOWN, {
					y: newY,
					time: ANIMATION_TIME,
					transition: 'easeOutQuad'
				});
		};
	},

	disable: function() {
		if (Storage.messageTray._hideNotification) {
			Main.messageTray._hideNotification = Storage.messageTray._hideNotification;
			delete Storage.messageTray._hideNotification;
		}
		if (Storage.messageTray._showNotification) {
			Main.messageTray._showNotification = Storage.messageTray._showNotification;
			delete Storage.messageTray._showNotification;
		}
		if (Storage.messageTray._onNotificationExpanded) {
			Main.messageTray._onNotificationExpanded = Storage.messageTray._onNotificationExpanded;
			delete Storage.messageTray._onNotificationExpanded;
		}
	},

	toggle: function() {
		togglePatch(CT_MessageTrayPatch, "MTP", settings.pref_notifications_enable_tweaks);
	}
};

const SHORTCUT_ID = "cinnamon-tweaks-window-demands-attention-shortcut";

const WindowDemandsAttentionClass = new Lang.Class({
	Name: "Window Demands Attention",

	_init: function() {
		if (settings.pref_win_demands_attention_activation_mode === "hotkey") {
			this._windows = [];
			IDS.CONNECTION_WDAE = global.display.connect(
				"window-demands-attention",
				Lang.bind(this, this._on_window_demands_attention)
			);
		} else if (settings.pref_win_demands_attention_activation_mode === "force") {
			this._tracker = Cinnamon.WindowTracker.get_default();
			this._handlerid = global.display.connect("window-demands-attention",
				Lang.bind(this, this._on_window_demands_attention));
		}
	},

	_on_window_demands_attention: function(aDisplay, aWin) {
		switch (settings.pref_win_demands_attention_activation_mode) {
			case "hotkey":
				this._windows.push(aWin);
				break;
			case "force":
				Main.activateWindow(aWin);
				break;
		}
	},

	_activate_last_window: function() {
		if (this._windows.length === 0) {
			Main.notify("No windows in the queue.");
			return;
		}

		let last_window = this._windows.pop();
		Main.activateWindow(last_window);
	},

	_add_keybindings: function() {
		Main.keybindingManager.addHotKey(
			SHORTCUT_ID,
			settings.pref_win_demands_attention_keyboard_shortcut,
			Lang.bind(this, this._activate_last_window));
	},

	_remove_keybindings: function() {
		Main.keybindingManager.removeHotKey(SHORTCUT_ID);
	},

	enable: function() {
		if (settings.pref_win_demands_attention_activation_mode === "hotkey")
			this._add_keybindings();
	},

	_destroy: function() {
		try {
			global.display.disconnect(this._handlerid);
		} catch (aErr) {}

		try {
			global.display.disconnect(IDS.CONNECTION_WDAE);
		} catch (aErr) {}

		IDS.CONNECTION_WDAE = 0;
		this._windows = null;
		this._remove_keybindings();
	}
});

var CT_WindowDemandsAttentionBehavior = {
	enable: function() {
		try {
			if (IDS.EXEC_WDAE > 0)
				this.disable();
		} finally {
			IDS.EXEC_WDAE = new WindowDemandsAttentionClass();
			IDS.EXEC_WDAE.enable();
		}
	},

	disable: function() {
		if (IDS.EXEC_WDAE > 0) {
			IDS.EXEC_WDAE._destroy();
			IDS.EXEC_WDAE = 0;
		}
	},

	toggle: function() {
		togglePatch(CT_WindowDemandsAttentionBehavior,
			"WDAE",
			settings.pref_win_demands_attention_activation_mode !== "none");
	}
};

/**
 * [Template]
 */
// var CT_Patch = {
// 	enable: function() {
// 		//
// 	},
//
// 	disable: function() {
// 		//
// 	},
//
// 	toggle: function() {
// 		togglePatch(CT_Patch, "Key from IDS object", settings.pref_that_enables_this_patch);
// 	}
// };

function togglePatch(aPatch, aID, aEnabledPref) {
	try {
		aPatch.disable();
		if (IDS[aID] > 0) {
			Mainloop.source_remove(IDS[aID]);
			IDS[aID] = 0;
		}

		if (!aEnabledPref)
			return true;

		IDS[aID] = Mainloop.timeout_add(1000, Lang.bind(aPatch, function() {
			aPatch.enable();
			IDS[aID] = 0;
			return false;
		}));
	} catch (aErr) {
		global.logError(aErr);
	}
}

function SettingsHandler(aUUID) {
	this._init(aUUID);
}

SettingsHandler.prototype = {
	__proto__: Settings.ExtensionSettings.prototype,

	_init: function(aUUID) {
		this._changed_timeout_id = 0;
		this.settings = new Settings.ExtensionSettings(this, aUUID);
		let bD = Settings.BindingDirection;
		let settingsArray = [
			[bD.IN, "pref_ask_confirmation_applet_removal", CT_AppletManagerPatch.toggle],
			[bD.IN, "pref_ask_confirmation_desklet_removal", CT_DeskletManagerPatch.toggle],
			[bD.IN, "pref_notifications_enable_tweaks", CT_MessageTrayPatch.toggle],
			[bD.IN, "pref_notifications_enable_animation", CT_MessageTrayPatch.toggle],
			[bD.IN, "pref_notifications_position", CT_MessageTrayPatch.toggle],
			[bD.IN, "pref_notifications_distance_from_panel", CT_MessageTrayPatch.toggle],
			[bD.IN, "pref_notifications_right_margin", CT_MessageTrayPatch.toggle],
			[bD.IN, "pref_win_demands_attention_activation_mode", CT_WindowDemandsAttentionBehavior.toggle],
			[bD.IN, "pref_win_demands_attention_keyboard_shortcut", CT_WindowDemandsAttentionBehavior.toggle],
		];
		for (let [binding, property_name, callback] of settingsArray) {
			this.settings.bindProperty(binding, property_name, property_name, callback, null);
		}
	}
};

function informAndDisable() {
	try {
		let msg = _("Extension ativation aborted!!!\n") +
			_("Your Cinnamon version may not be compatible!!!\n") +
			_("Minimum Cinnamon version allowed: 2.8.6");
		global.logError(msg);
		Main.criticalNotify(metadata.name, msg);
	} finally {
		let enabledExtensions = global.settings.get_strv("enabled-extensions");
		Extension.unloadExtension(metadata.uuid, Extension.Type.EXTENSION);
		enabledExtensions.splice(enabledExtensions.indexOf(metadata.uuid), 1);
		global.settings.set_strv("enabled-extensions", enabledExtensions);
	}
}

/**
 * Called when extension is loaded
 */
function init(aExtensionMeta) {
	metadata = aExtensionMeta;
	UUID = metadata.uuid;
	settings = new SettingsHandler(UUID);
	Gettext.bindtextdomain(UUID, GLib.get_home_dir() + "/.local/share/locale");

	let extensionImports = imports.ui.extensionSystem.extensions[UUID];

	let utils = extensionImports.utils;
	ConfirmationDialog = utils.ConfirmationDialog;

	let versionCompare = utils.versionCompare;
	try {
		allowEnabling = versionCompare(GLib.getenv("CINNAMON_VERSION"), "2.8.6") >= 0;
	} catch (aErr) {
		global.logError(aErr.message);
		allowEnabling = false;
	}
}

/**
 * Called when extension is loaded
 */
function enable() {
	// DO NOT allow to enable extension if it isn't installed on a proper Cinnamon version.
	if (allowEnabling) {
		try {
			if (settings.pref_ask_confirmation_applet_removal)
				CT_AppletManagerPatch.enable();
		} catch (aErr) {
			global.logError(aErr.message);
		}

		try {
			if (settings.pref_ask_confirmation_desklet_removal)
				CT_DeskletManagerPatch.enable();
		} catch (aErr) {
			global.logError(aErr.message);
		}

		try {
			if (settings.pref_notifications_enable_tweaks)
				CT_MessageTrayPatch.enable();
		} catch (aErr) {
			global.logError(aErr.message);
		}

		try {
			if (settings.pref_win_demands_attention_activation_mode !== "none")
				CT_WindowDemandsAttentionBehavior.enable();
		} catch (aErr) {
			global.logError(aErr.message);
		}
	} else
		informAndDisable();
}

/**
 * Called when extension gets disabled
 */
function disable() {
	CT_AppletManagerPatch.disable();
	CT_DeskletManagerPatch.disable();
	CT_MessageTrayPatch.disable();
	CT_WindowDemandsAttentionBehavior.disable();
}
