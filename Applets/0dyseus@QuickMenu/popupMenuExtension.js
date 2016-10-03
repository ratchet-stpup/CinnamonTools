// Popup Menu Extension for Cinnamon Applet
// Contains a Popup Menu Item with an icon to the left, the text to the right and a command associated to the menu
// And a Popup SubMenu Item with an icon to the left, the text to the right
// Developed by Nicolas LLOBERA <nllobera@gmail.com>
// version: 2.0 (11-09-2013)
// License: GPLv3
// Copyright © 2013 Nicolas LLOBERA

const Lang = imports.lang;

const PopupMenu = imports.ui.popupMenu;

const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;

// Redefine a PopupImageMenuItem to get a colored image to the left side
function PopupImageLeftMenuItem() {
	this._init.apply(this, arguments);
}

PopupImageLeftMenuItem.prototype = {
	__proto__: PopupMenu.PopupBaseMenuItem.prototype,

	_init: function(aDisplayName, aIconName, aCommand, aIconSize, aParams) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, aParams);

		// useful to use application in the connect method
		this.command = aCommand;
		this._icon_size = aIconSize;

		this._icon = this._createIcon(aIconName);
		this.addActor(this._icon);

		this.label = new St.Label({
			text: aDisplayName
		});
		this.addActor(this.label);
	},

	_createIcon: function(aIconName) {
		// if the aIconName is a path to an icon
		if (aIconName[0] === '/') {
			var file = Gio.file_new_for_path(aIconName);
			var iconFile = new Gio.FileIcon({
				file: file
			});

			return new St.Icon({
				gicon: iconFile,
				icon_size: this._icon_size
			});
		} else // use a themed icon
			return new St.Icon({
			icon_name: aIconName,
			icon_size: this._icon_size,
			icon_type: St.IconType.FULLCOLOR
		});
	}
};

// Redefine a PopupSubMenuMenuItem to get a colored image to the left side
function PopupLeftImageSubMenuMenuItem() {
	this._init.apply(this, arguments);
}

PopupLeftImageSubMenuMenuItem.prototype = {
	__proto__: PopupMenu.PopupSubMenuMenuItem.prototype,

	_init: function(aDisplayName, aIconName, aIconSize, aParams) {
		PopupMenu.PopupBaseMenuItem.prototype._init.call(this, aParams);

		this.actor.add_style_class_name('popup-submenu-menu-item');
		this._icon_size = aIconSize;

		this._icon = this._createIcon(aIconName);
		this.addActor(this._icon);

		this.label = new St.Label({
			text: aDisplayName
		});
		this.addActor(this.label);

		if (this.actor.get_direction() == St.TextDirection.RTL) {
			this._triangle = new St.Label({
				text: '\u25C2'
			});
		} else {
			this._triangle = new St.Label({
				text: '\u25B8'
			});
		}

		this.addActor(this._triangle, {
			align: St.Align.END
		});

		this.menu = new PopupMenu.PopupSubMenu(this.actor, this._triangle);
		this.menu.connect('open-state-changed', Lang.bind(this, this._subMenuOpenStateChanged));
	},

	_createIcon: function(aIconName) {
		// if the aIconName is a path to an icon
		if (aIconName[0] === '/') {
			var file = Gio.file_new_for_path(aIconName);
			var iconFile = new Gio.FileIcon({
				file: file
			});

			return new St.Icon({
				gicon: iconFile,
				icon_size: this._icon_size
			});
		} else // use a themed icon
			return new St.Icon({
			icon_name: aIconName,
			icon_size: this._icon_size,
			icon_type: St.IconType.FULLCOLOR
		});
	}
};
