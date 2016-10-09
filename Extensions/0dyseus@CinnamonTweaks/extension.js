const Lang = imports.lang;
const St = imports.gi.St;
const Settings = imports.ui.settings;
const Main = imports.ui.main;
const AppletManager = imports.ui.appletManager;
const DeskletManager = imports.ui.deskletManager;
const Mainloop = imports.mainloop;
const ModalDialog = imports.ui.modalDialog;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext;
const Extension = imports.ui.extension;

let settings,
	metadata,
	allowEnabling = false;

var UUID;

function _(aStr) {
	// Thanks to https://github.com/lestcape for this!!!
	let customTrans = Gettext.dgettext(UUID, aStr);
	if (customTrans != aStr) {
		return customTrans;
	}
	return Gettext.gettext(aStr);
}

/*
 * Container for old attributes and functions for later restore.
 */
let Storage = {
	messageTray: {},
	appletmanager: {},
	deskletManager: {}
};

function unpatchAppletManager() {
	if (Storage.appletmanager._removeAppletFromPanel) {
		AppletManager._removeAppletFromPanel = Storage.appletmanager._removeAppletFromPanel;
		delete Storage.appletmanager._removeAppletFromPanel;
	}
}

function patchAppletManager() {
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
				.format(AppletManager.get_object_for_uuid(uuid, applet_id)._meta.name, applet_id)).open();
	};
}

function unpatchDeskletManager() {
	if (Storage.deskletManager.removeDesklet) {
		DeskletManager.removeDesklet = Storage.deskletManager.removeDesklet;
		delete Storage.deskletManager.removeDesklet;
	}
}

function patchDeskletManager() {
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
				.format(DeskletManager.get_object_for_uuid(uuid, desklet_id)._meta.name, desklet_id)).open();
	};
}

function unpatchMessageTray() {
	if (Storage.messageTray._hideNotification) {
		Main.messageTray._hideNotification = Storage.messageTray._hideNotification;
		delete Storage.messageTray._hideNotification;
	}
	if (Storage.messageTray._onNotificationExpanded) {
		Main.messageTray._onNotificationExpanded = Storage.messageTray._onNotificationExpanded;
		delete Storage.messageTray._onNotificationExpanded;
	}
}

function patchMessageTray() {
	let mt = Main.messageTray;
	let ANIMATION_TIME = 0.001;
	let State = {
		HIDDEN: 0,
		SHOWING: 1,
		SHOWN: 2,
		HIDING: 3
	};
	// Extracted from /usr/share/cinnamon/js/ui/messageTray.js
	Storage.messageTray._hideNotification = mt._hideNotification;
	mt._hideNotification = function() {
		this._focusGrabber.ungrabFocus();
		if (this._notificationExpandedId) {
			this._notification.disconnect(this._notificationExpandedId);
			this._notificationExpandedId = 0;
		}

		this._tween(this._notificationBin, '_notificationState', State.HIDDEN, {
			y: Main.layoutManager.primaryMonitor.y,
			opacity: 0,
			time: ANIMATION_TIME,
			transition: 'easeOutQuad',
			onComplete: this._hideNotificationCompleted,
			onCompleteScope: this
		});
	};

	Storage.messageTray._onNotificationExpanded = mt._onNotificationExpanded;
	mt._onNotificationExpanded = function() {
		let expandedY = this._notification.actor.height - this._notificationBin.height;

		let monitor = Main.layoutManager.primaryMonitor;
		let panel = Main.panelManager.getPanel(0, true); // If Cinnamon 3.0.7 stable and older
		if (!panel)
			panel = Main.panelManager.getPanel(0, 1); // If Cinnamon 3.0.7 nightly and newer(?)
		let height = 0;
		if (panel)
			height += panel.actor.get_height();
		let newY = monitor.height - this._notificationBin.height - height -
			Number(settings.pref_notifications_distance_from_panel);

		if (this._notificationBin.y < expandedY)
			this._notificationBin.y = expandedY;
		else if (this._notification.y != expandedY)
			this._tween(this._notificationBin, '_notificationState', State.SHOWN, {
				y: newY,
				time: ANIMATION_TIME,
				transition: 'easeOutQuad'
			});
	};
}

function ConfirmationDialog() {
	this._init.apply(this, arguments);
}

ConfirmationDialog.prototype = {
	__proto__: ModalDialog.ModalDialog.prototype,

	_init: function(aCallback, aDialogLabel, aDialogMessage, aData1, aData2) {
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
			label: _("Cancel"),
			action: Lang.bind(this, function() {
				this.close();
			}),
			key: Clutter.Escape
		}, {
			label: _("OK"),
			action: Lang.bind(this, function() {
				this.close();
				aCallback();
			})
		}]);
	}
};

function SettingsHandler(aUUID) {
	this._init(aUUID);
}

SettingsHandler.prototype = {
	_init: function(aUUID) {
		this._changed_timeout_id = 0;
		this.settings = new Settings.ExtensionSettings(this, aUUID);
		let bD = Settings.BindingDirection;
		let settingsArray = [
			[bD.IN, "pref_ask_confirmation_applet_removal", this._onSettingsChanged],
			[bD.IN, "pref_ask_confirmation_desklet_removal", this._onSettingsChanged],
			[bD.IN, "pref_notifications_at_bottom_right", this._onSettingsChanged],
			[bD.IN, "pref_notifications_distance_from_panel", this._onSettingsChanged],
			[bD.BIDIRECTIONAL, "pref_allow_activation", null],
		];
		for (let [binding, property_name, callback] of settingsArray) {
			this.settings.bindProperty(binding, property_name, property_name, callback, null);
		}
	},

	_onSettingsChanged: function() {
		disable();
		if (this._changed_timeout_id > 0) {
			Mainloop.source_remove(this._changed_timeout_id);
			this._changed_timeout_id = 0;
		}

		this._changed_timeout_id = Mainloop.timeout_add(1000, Lang.bind(this, function() {
			enable();
			this._changed_timeout_id = 0;
			return false;
		}));
	},

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
	let compareVersions = extensionImports.version_compare.versionCompare;
	try {
		allowEnabling = compareVersions(GLib.getenv("CINNAMON_VERSION"), "2.8.6") >= 0;
	} catch (aErr) {
		global.logError(aErr.message);
		allowEnabling = false;
	} finally {
		settings.pref_allow_activation = allowEnabling;
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
				patchAppletManager();
		} catch (aErr) {
			global.logError(aErr.message);
		}

		try {
			if (settings.pref_ask_confirmation_desklet_removal)
				patchDeskletManager();
		} catch (aErr) {
			global.logError(aErr.message);
		}

		try {
			if (settings.pref_notifications_at_bottom_right)
				patchMessageTray();
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
	unpatchAppletManager();
	unpatchDeskletManager();
	unpatchMessageTray();
}
