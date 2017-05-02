#!/usr/bin/python3

"""
TODOs:
    * Create an exit function in case the script is executed on any version of
      Cinnamon lower than 2.8.x.
    * I had to do a lot of juggling to create a function that would create a
      time stamp of the same format as xgettext. It needs more testing to see
      if the time zone is correctly calculated.
"""

import os
import json
import subprocess
import tempfile
import datetime
import time

from gi.repository import GLib
from optparse import OptionParser

__version__ = "1.0.32"

try:
    import polib
except:
    print("""

    Module "polib" not available.

    Please install the package "python3-polib" (or your distribution's
    equivalent) and try again.

    make-xlet-pot.py script version: {0}
    """.format(__version__))
    quit()


XLET_DIR = os.getcwd()


def get_uuid():
    try:
        file = open(os.path.join(XLET_DIR, "metadata.json"), "r")
        raw_meta = file.read()
        file.close()
        md = json.loads(raw_meta)
        return md["uuid"]
    except Exception as detail:
        print("Failed to get UUID - missing, corrupt, or incomplete metadata.json file")
        print(detail)
        quit()


XLET_UUID = get_uuid()
HOME = os.path.expanduser("~")
LOCALE_INST = "%s/.local/share/locale" % HOME
USAGE = """

SYNOPSIS

make-xlet-pot [-j or --js] [-p or --py] [-c or --custom-header]
              [-s key1,keyN or --skip-keys=key1,keyN] [<potfile name> or empty]

make-xlet-pot [-a or --all] [-s key1,keyN or --skip-keys=key1,keyN]

make-xlet-pot [-i or --install]

make-xlet-pot [-r or --remove]

OPTIONS

=======================================================
All options should only be run from your xlet directory
=======================================================

-j
--js
    Runs xgettext on any JavaScript files in your directory before
    scanning the settings-schema.json and metadata.json files.
    This allows you to generate a .pot file for your entire xlet at once.

-p
--py
    Same as the previous option, but for Python files.

-c
--custom-header
    It allows to use a custom header for the generated .pot file instead of the
    one enforced by xgettext that has to be edited manually. Some data is
    automatically generated and some needs to be specified in a <settings file>.

    Automatically generated data:
    PACKAGE:
        The xlet UUID will be used as the package name.

    VERSION:
        The xlet version extracted from the metadata.json file (if exists).

    COPY_CURRENT_YEAR:
        The copyright current year.

    TIMESTAMP:
        The current date in the format YEAR-MO-DA HO:MI+ZONE.

    SCRIPT_VERSION:
        This script version.

    Data specified in a <settings file>:
        COPY_INITIAL_YEAR:
            The copyright year when the .pot file was initially created by the
            FIRST_AUTHOR.

        FIRST_AUTHOR:
            The .pot file and/or the xlet creator.

        FIRST_AUTHOR_EMAIL:
            The e-mail address of the .pot file and/or the xlet creator.

        <settings file>:
            This file is a .json file with the exact same name of the xlet UUID
            plus the .json extension. Its content should be a "JSON object" like
            the following and whose keys are all optional (leave the comments
            so nobody touches the file):

            {
                "__comment1__": "DO NOT DELETE/MOVE/RENAME/EDIT!!!",
                "__comment2__": "Data used to generate the .pot file",
                "FIRST_AUTHOR": "FIRST_AUTHOR",
                "FIRST_AUTHOR_EMAIL": "FIRST_AUTHOR_EMAIL",
                "COPY_INITIAL_YEAR": "COPY_INITIAL_YEAR"
            }

-s key1,key2,keyN
--skip-keys key1,key2,keyN
    A comma separated list of preference keys as found inside the
    settings-schema.json file to be ignored by the strings extractor.

-a
--all
    This argument is an "special shortcut". Using this argument is equivalent
    to using the arguments --js, --py and --custom-header all at the same time.
    In addition, this argument ignores the <potfile name> argument. The pot file
    name is automatically set to the xlet UUID and its destination will be the
    "po" folder inside your xlet. If the "po" folder doesn't exists, it will be
    automatically created.

-i
--install
    Compiles and installs any .po files contained in a po folder
    to the system locale store.  Use this option to test your translations
    locally before uploading to Spices. It will use the xlet UUID
    as the translation domain.

-r
--remove
    The opposite of install, removes translations from the store.
    Again, it uses the UUID to find the correct files to remove.

<potfile name> - Name of the .pot file to work with.  This can be pre-existing,
or the name of a new file to use.  If you leave off the .pot extension, it will
be automatically appended to the file name. If no name is provided, the xlet
UUID will be used as the file name.

For instance:

make-xlet-pot myapplet

Will generate a file called myapplet.pot, or append
to a file of that name.  This can then be used by translators to be
made into a po file.

For example:

msginit --locale=fr --input=myapplet.pot

Will create "fr.po" for the French language.  A translator can use a utility
such as poedit to add translations to this file, or edit the file manually.

.po files can be added to a "po" folder in your xlet's directory,
and will be compiled and installed into the system when the xlet is installed
via Cinnamon Settings.
"""

POT_HEADER = """# This is a template file for translating the {PACKAGE} package.
# Copyright (C) {COPY_INITIAL_YEAR}{COPY_CURRENT_YEAR}
# This file is distributed under the same license as the {PACKAGE} package.
# {FIRST_AUTHOR} {FIRST_AUTHOR_EMAIL}, {COPY_INITIAL_YEAR}{COPY_CURRENT_YEAR}.
#
msgid ""
msgstr ""
"Project-Id-Version: {PACKAGE} {VERSION}\\n"
"POT-Creation-Date: {TIMESTAMP}\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: make-xlet-pot.py {SCRIPT_VERSION}\\n"
"""


def get_time_zone():
    if time.localtime().tm_isdst and time.daylight:
        tzone = -time.altzone
    else:
        tzone = -time.timezone

    # Up to here, tzone is an integer.
    tzone = str(tzone / 60 / 60)

    # And the ugliness begins!!!
    [h, m] = tzone.split(".")

    isNegative = int(h) < 0
    hours = "{0:03d}".format(int(h)) if isNegative else "{0:02d}".format(int(h))
    minutes = "{0:02d}".format(int(m))

    try:
        return (hours if isNegative else "+" + hours) + minutes
    except:
        return "+0000"


def get_timestamp():
    """Returns a time stamp in the same format used by xgettex."""
    now = datetime.datetime.now()
    # Since the "padding" with zeroes of the rest of the values converts
    # them into strings, lets convert to string the year too.
    YEAR = str(now.year)
    # "Pad" all the following values with zeroes.
    MO = "{0:02d}".format(now.month)
    DA = "{0:02d}".format(now.day)
    HO = "{0:02d}".format(now.hour)
    MI = "{0:02d}".format(now.minute)
    ZONE = get_time_zone()

    return "%s-%s-%s %s:%s%s" % (YEAR, MO, DA, HO, MI, ZONE)


def remove_empty_folders(path):
    if not os.path.isdir(path):
        return

    # Remove empty sub folders
    files = os.listdir(path)
    if len(files):
        for f in files:
            fullpath = os.path.join(path, f)
            if os.path.isdir(fullpath):
                remove_empty_folders(fullpath)

    # If folder empty, delete it
    files = os.listdir(path)
    if len(files) == 0:
        print("Removing empty folder: %s" % path)
        os.rmdir(path)


class Main:

    def __init__(self):
        parser = OptionParser(usage=USAGE)
        parser.add_option("-a", "--all", action="store_true", dest="all", default=False)
        parser.add_option("-j", "--js", action="store_true", dest="js", default=False)
        parser.add_option("-p", "--py", action="store_true", dest="py", default=False)
        parser.add_option("-s", "--skip-keys", dest="skip_keys")
        parser.add_option("-c", "--custom-header", action="store_true",
                          dest="custom_header", default=False)
        parser.add_option("-i", "--install", action="store_true", dest="install", default=False)
        parser.add_option("-r", "--remove", action="store_true", dest="remove", default=False)

        (options, args) = parser.parse_args()

        if options.install:
            self.do_install()

        if options.remove:
            self.do_remove()

        if not (options.all or options.js or options.py) and not args:
            parser.print_help()
            quit()

        if options.all:
            os.makedirs(os.path.join(XLET_DIR, "po"), exist_ok=True)
            self.potname = "po/" + XLET_UUID + ".pot"
        else:
            self.potname = args[0] if args else None

        # Comma separated list of strings (preference keys) to ignore by the string extractor.
        if options.skip_keys:
            self.ignore_list = options.skip_keys
        else:
            self.ignore_list = None

        if not self.potname:
            self.potname = XLET_UUID + ".pot"

        if not self.potname.endswith(".pot"):
            self.potname = self.potname + ".pot"

        self.potpath = os.path.join(XLET_DIR, self.potname)

        if options.all or options.js or options.py:
            try:
                subprocess.call(["xgettext", "--version"])
            except OSError:
                print("xgettext not found, you may need to install the gettext package")
                quit()

        xgettext_cmd = [
            "xgettext",
            "--language={language}",
            "{join_existing}",
            "--add-comments",
            "--from-code=UTF-8",
            "--keyword=_",
            "--output={pot_name}",
            "--files-from={file_path}"
        ]

        if options.js or options.all:
            js_tmp = tempfile.NamedTemporaryFile(prefix="makepot-js-")

            print("Running xgettext on JavaScript files...")

            try:
                # Using a shell command instead of python seems to be infinitely faster.
                os.system('find . -iname "*.js" > %s' % js_tmp.name)
            finally:
                os.system(" ".join(xgettext_cmd).format(language="JavaScript",
                                                        join_existing="",
                                                        pot_name=self.potname,
                                                        file_path=js_tmp.name))
                js_tmp.flush()
                js_tmp.close()

        if options.py or options.all:
            python_tmp = tempfile.NamedTemporaryFile(prefix="makepot-py-")

            print("Running xgettext on Python files...")

            try:
                # Using a shell command instead of python seems to be infinitely faster.
                os.system('find . -iname "*.py" > %s' % python_tmp.name)
            finally:
                os.system(" ".join(xgettext_cmd)
                          .format(language="Python",
                                  join_existing=(
                                      "--join-existing"
                                      if (options.js and options.py) or options.all
                                      else ""),
                                  pot_name=self.potname,
                                  file_path=python_tmp.name))
                python_tmp.flush()
                python_tmp.close()

        self.current_parent_dir = ""

        append = False
        if os.path.exists(self.potpath):
            append = True

        if append:
            self.po = polib.pofile(self.potpath)
        else:
            self.po = polib.POFile()

        print("Scanning metadata.json and settings-schema.json...")
        self.scan_dirs()

        if append:
            self.po.save()
        else:
            self.po.save(fpath=self.potpath)

        print("Extraction complete")

        if options.custom_header or options.all:
            self.insert_custom_header()
        else:
            print("Quitting...")
            quit()

    def insert_custom_header(self):
        metadata = None

        try:
            md_file = open(os.path.join(XLET_DIR, "metadata.json"), "r")
            raw_meta = md_file.read()
            md_file.close()
            md = json.loads(raw_meta)

            metadata = {
                "FIRST_AUTHOR": "FIRST_AUTHOR",
                "FIRST_AUTHOR_EMAIL": "<EMAIL@ADDRESS>",
                "COPY_INITIAL_YEAR": "",
                "COPY_CURRENT_YEAR": str(datetime.datetime.now().year),
                "PACKAGE": md["uuid"] if "uuid" in md else "PACKAGE",
                "VERSION": md["version"] if "version" in md else "VERSION",
                "SCRIPT_VERSION": __version__,
                "TIMESTAMP": get_timestamp(),
            }
        except Exception as detail:
            print("Failed to get metadata - missing, corrupt, or incomplete metadata.json file")
            print(detail)
            quit()

        if metadata is None:
            quit()

        try:
            path = os.path.join(XLET_DIR, "po", metadata["PACKAGE"] + ".json")
            if os.path.exists(path):
                with open(path, "r") as settings_file:
                    raw_data = settings_file.read()
                    data = json.loads(raw_data)
                    current_year = metadata["COPY_CURRENT_YEAR"]

                    if "COPY_INITIAL_YEAR" in data and str(data["COPY_INITIAL_YEAR"]) != current_year:
                        copy_initial_year = (data["COPY_INITIAL_YEAR"] + "-")
                    else:
                        copy_initial_year = ""

                    if "FIRST_AUTHOR" in data:
                        first_author = data["FIRST_AUTHOR"]
                    else:
                        first_author = "FIRST_AUTHOR"

                    if "FIRST_AUTHOR_EMAIL" in data:
                        first_author_email = data["FIRST_AUTHOR_EMAIL"]
                    else:
                        first_author_email = "<EMAIL@ADDRESS>"

                    metadata["COPY_INITIAL_YEAR"] = copy_initial_year
                    metadata["FIRST_AUTHOR"] = first_author
                    metadata["FIRST_AUTHOR_EMAIL"] = first_author_email

                settings_file.close()
        except:
            pass

        try:
            with open(self.potpath, "r") as pot_file:
                raw_data = pot_file.readlines()

            pot_file.close()

            with open(self.potpath, "w") as pot_file:
                raw_data_no_header = "".join(raw_data[raw_data.index("\n"):])
                new_header = POT_HEADER.format(
                    FIRST_AUTHOR=metadata["FIRST_AUTHOR"],
                    FIRST_AUTHOR_EMAIL=metadata["FIRST_AUTHOR_EMAIL"],
                    COPY_CURRENT_YEAR=metadata["COPY_CURRENT_YEAR"],
                    COPY_INITIAL_YEAR=metadata["COPY_INITIAL_YEAR"],
                    PACKAGE=metadata["PACKAGE"],
                    VERSION=metadata["VERSION"],
                    SCRIPT_VERSION=metadata["SCRIPT_VERSION"],
                    TIMESTAMP=metadata["TIMESTAMP"]
                )
                pot_file.write(new_header + raw_data_no_header)

            pot_file.close()
        except Exception as detail:
            print("Failed to set custom header")
            print(detail)
            quit()

        quit()

    def do_install(self):
        podir = os.path.join(XLET_DIR, "po")
        done_one = False
        for root, subFolders, files in os.walk(podir, topdown=False):
            for file in files:
                parts = os.path.splitext(file)
                if parts[1] == ".po":
                    this_locale_dir = os.path.join(LOCALE_INST, parts[0], "LC_MESSAGES")
                    GLib.mkdir_with_parents(this_locale_dir, 0o755)
                    subprocess.call(["msgfmt", "-c", os.path.join(root, file), "-o",
                                     os.path.join(this_locale_dir, "%s.mo" % XLET_UUID)])
                    done_one = True
        if done_one:
            print("Install complete for domain: %s" % XLET_UUID)
        else:
            print("Nothing installed")
        quit()

    def do_remove(self):
        done_one = False
        if (os.path.exists(LOCALE_INST)):
            i19_folders = os.listdir(LOCALE_INST)
            for i19_folder in i19_folders:
                if os.path.isfile(os.path.join(LOCALE_INST,
                                               i19_folder,
                                               "LC_MESSAGES",
                                               "%s.mo" % XLET_UUID)):
                    done_one = True
                    os.remove(os.path.join(LOCALE_INST,
                                           i19_folder,
                                           "LC_MESSAGES",
                                           "%s.mo" % XLET_UUID))
                remove_empty_folders(os.path.join(LOCALE_INST, i19_folder))
        if done_one:
            print("Removal complete for domain: %s" % XLET_UUID)
        else:
            print("Nothing to remove")
        quit()

    def scan_dirs(self):
        for root, subFolders, files in os.walk(XLET_DIR, topdown=False):
            for file in files:
                if file == "settings-schema.json":
                    fp = open(os.path.join(root, file))
                    raw = fp.read()
                    data = {}
                    data = json.loads(raw)
                    fp.close()
                    self.current_parent_dir = os.path.split(root)[1]
                    self.extract_strings(data)
                elif file == "metadata.json":
                    fp = open(os.path.join(root, file))
                    data = json.load(fp)
                    fp.close()

                    self.current_parent_dir = os.path.split(root)[1]
                    self.extract_metadata_strings(data)

    def extract_strings(self, data, parent=""):
        if self.ignore_list is not None:
            ignores = self.ignore_list.split(",")
        else:
            ignores = []

        for key in list(data.keys()):
            if key in ignores:
                continue

            if key in ("description", "tooltip", "units", "title"):
                comment = "%s->settings-schema.json->%s->%s" % (
                    self.current_parent_dir, parent, key)
                self.save_entry(data[key], comment)
            elif key in "options":
                opt_data = data[key]
                for option in list(opt_data.keys()):
                    if opt_data[option] == "custom":
                        continue
                    comment = "%s->settings-schema.json->%s->%s" % (
                        self.current_parent_dir, parent, key)
                    self.save_entry(option, comment)
            try:
                self.extract_strings(data[key], key)
            except AttributeError:
                pass

    def extract_metadata_strings(self, data):
        for key in data:
            if key in ("name", "description", "comments"):
                comment = "%s->metadata.json->%s" % (self.current_parent_dir, key)
                self.save_entry(data[key], comment)
            elif key == "contributors":
                comment = "%s->metadata.json->%s" % (self.current_parent_dir, key)

                values = data[key]
                if isinstance(values, str):
                    values = values.split(",")

                for value in values:
                    self.save_entry(value.strip(), comment)

    def save_entry(self, msgid, comment):
        try:
            msgid = msgid
        except UnicodeEncodeError:
            return

        if not msgid.strip():
            return

        entry = self.po.find(msgid)
        if entry:
            if comment not in entry.comment:
                if entry.comment:
                    entry.comment += "\n"
                entry.comment += comment
        else:
            entry = polib.POEntry(msgid=msgid, comment=comment)
            self.po.append(entry)


if __name__ == "__main__":
    Main()
