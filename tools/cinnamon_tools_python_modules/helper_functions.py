#!/usr/bin/python3

import os
import sys
import subprocess
import fnmatch
import itertools
import gi
from . import xlets_meta
from . import ansi_colors
from . import changelog_sanitizer

gi.require_version("Gtk", "3.0")

from gi.repository import GLib
from subprocess import Popen

Ansi = ansi_colors.ANSIColors()
env = os.environ.copy()
home = os.path.expanduser("~")

# Keeping this variable here so I don't have to use ugly indentation inside functions.
git_log_cmd = 'git log --grep=General --invert-grep --pretty=format:"\
- **Date:** %aD%n\
- **Commit:** [%h](https://github.com/Odyseus/CinnamonTools/commit/%h)%n\
- **Author:** %aN%n%n\`\`\`%n%s%n%b%n\`\`\`%n%n***%n" \
-- {relative_xlet_path} {append_or_override} "{tmp_log_path}"'


class XletsHelperCore():

    def __init__(self, root_path):
        super(XletsHelperCore, self).__init__()
        self.root_path = root_path

        try:
            self.xlets_meta = xlets_meta.XletsMeta(root_path=root_path)
        except:
            self.generate_meta_file()

    def generate_meta_file(self):
        """generate_meta_file

        Generate the file containing all the metadata of all xlets on this repository.
        This metadata files is used by several functions on the XletsHelperCore class.
        """
        xlets_meta.generate_meta_file(self.root_path)

    def compare_xlets(self, compare_applets=True, compare_extensions=True):
        """compare_xlets

        Compare installed xlets with the ones found on the repository using meld.

        Keyword Arguments:
            compare_applets {Bool} -- Compare applets? (default: {True})
            compare_extensions {Bool} -- Compare extensions? (default: {True})
        """
        user_xlets_path = os.path.join(home, ".local", "share", "cinnamon")

        for xlet in self.xlets_meta.list:
            user_xlet_path = os.path.join(user_xlets_path, "%ss" % xlet["type"], xlet["uuid"])
            repo_xlet_path = os.path.join(self.root_path, "%ss" % xlet["type"], xlet["uuid"],
                                          "files", xlet["uuid"])

            if xlet["type"] == "applet" and not compare_applets:
                continue

            if xlet["type"] == "extension" and not compare_extensions:
                continue

            cmd = "meld %s %s 2>&1 &" % (user_xlet_path, repo_xlet_path)
            self.exec_command(cmd=cmd,
                              working_directory=self.root_path,
                              do_wait=False,
                              do_log=False)

    def set_executables(self, widget=None):
        self.check_set_permission(set_exec=True)

    def check_executables(self, widget=None):
        self.check_set_permission(set_exec=False)

    def check_set_permission(self, set_exec=False):
        """check_set_permission

        Check if the files that needs to be executable actually are.

        Keyword Arguments:
            set_exec {Bool} -- Set execution flag to all files listed. (default: {False})
        """
        py_list = locate("*.py", self.root_path)
        sh_list = locate("*.sh", self.root_path)

        for p in itertools.chain(py_list, sh_list):
            if "/tools/" not in p and not is_exec(p):
                print(Ansi.WARN("Not an executable: %s" % p[len(self.root_path):]))

                if set_exec:
                    print(Ansi.INFO("Setting it as such..."))
                    os.chmod(p, 0o755)

    def create_changelogs(self):
        """create_changelogs

        Generate the CHANGELOG.md files for all xlets.
        """
        print(Ansi.WARN("Generating change logs..."))

        logs_storage = os.path.join(self.root_path, "tmp", "changelogs")

        GLib.mkdir_with_parents(logs_storage, 0o755)

        for xlet in self.xlets_meta.list:
            print(Ansi.INFO("Generating change log for %s..." % xlet["name"]))

            try:
                xlet_root_folder = get_parent_dir(xlet["meta-path"], 2)
                tmp_log_path = os.path.join(logs_storage, xlet["uuid"] + ".md")

                # Generate change log from current repository paths.
                relative_xlet_path1 = "./" + xlet["type"] + "s/" + xlet["uuid"]
                cmd1 = git_log_cmd.format(relative_xlet_path=relative_xlet_path1,
                                          append_or_override=">",
                                          tmp_log_path=tmp_log_path)
                self.exec_command(cmd=cmd1,
                                  working_directory=self.root_path)

                # Generate change log from old repository paths (before repository rearrangement).
                # Then append them to the previously generated change log.
                relative_xlet_path2 = "./" + xlet["type"].capitalize() + "s/" + xlet["uuid"]
                cmd2 = git_log_cmd.format(relative_xlet_path=relative_xlet_path2,
                                          append_or_override=">>",
                                          tmp_log_path=tmp_log_path)
                self.exec_command(cmd=cmd2,
                                  working_directory=self.root_path)
            finally:
                # Sanitize and clean up formatting of the change logs and
                # copy them to their final destinations.
                sanitizer = changelog_sanitizer.ChangelogSanitizer(
                    xlet_name=xlet["name"],
                    source_path=tmp_log_path,
                    target_path=xlet_root_folder + "/CHANGELOG.md"
                )

                sanitizer.sanitize()

    def update_pot_files(self):
        """update_pot_files

        Update all .pot files from all xlets.
        """
        print(Ansi.WARN("Starting POT files update..."))

        for xlet in self.xlets_meta.list:
            xlet_folder_path = get_parent_dir(xlet["meta-path"], 0)

            if os.path.exists(xlet_folder_path):
                print(Ansi.INFO(
                    "Updating localization template for %s..." % xlet["name"]))

                cmd = "make-xlet-pot --all"
                self.exec_command(cmd=cmd,
                                  working_directory=xlet_folder_path)

    def create_localized_help(self, dev=False):
        """create_localized_help

        Execute the create_localized_help.py script for each xlet to generate their HELP.html files.
        """
        print(Ansi.WARN("Starting localized help creation..."))

        for xlet in self.xlets_meta.list:
            script_folder_path = get_parent_dir(xlet["meta-path"], 2)
            script_file_path = os.path.join(script_folder_path, "create_localized_help.py")

            if os.path.exists(script_file_path):
                print(Ansi.INFO("Creating localized help for %s..." % xlet["name"]))

                arg = "--dev" if dev is True else "--production"
                cmd = "%s %s" % (script_file_path, arg)
                self.exec_command(cmd=cmd,
                                  working_directory=script_folder_path)

    def render_main_site(self, working_directory):
        """render_main_site

        Renders the main site (creates the HTML files from PUG sources).
        The main site is just the GitHub page associated with the repository.
        https://odyseus.github.io/CinnamonTools

        Arguments:
            working_directory {String} -- Working directory for the script that lanches the
            needed commands.
        """
        print(Ansi.WARN("Starting rendering of main site..."))

        cmd = "./tools/helper_shell_scripts/helper_shell_scripts.sh render-main-site &"
        self.exec_command(cmd=cmd,
                          working_directory=working_directory)

    def clone_wiki(self):
        """clone_wiki

        Clones the repository's wiki into the /docs folder.
        The wiki's files are used to create part of the main site.
        """
        print(Ansi.WARN("Cloning repository's wiki..."))

        cmd = "git clone https://github.com/Odyseus/CinnamonTools.wiki.git &"
        self.exec_command(cmd=cmd,
                          working_directory=os.path.join(self.root_path, "docs"))

    def generate_trans_stats(self):
        """[summary]

        Generates files that contain the amount of untranslated strings an xlet has.
        """
        print(Ansi.WARN("Generating translation statistics..."))

        cmd = "./tools/helper_shell_scripts/helper_shell_scripts.sh generate-trans-stats &"
        self.exec_command(cmd=cmd,
                          working_directory=self.root_path)

    def update_spanish_localizations(self):
        """[summary]

        Update all Spanish localizations from all xlets.
        """
        print(Ansi.WARN("Updating Spanish localizations..."))

        cmd = "./tools/helper_shell_scripts/helper_shell_scripts.sh update-spanish-localizations &"
        self.exec_command(cmd=cmd,
                          working_directory=self.root_path)

    def create_packages(self):
        """create_packages

        Packages all the xlets found in the repository and saves them into /docs/pkg folder.
        The shasum of each xlet folder is stored into /tmp/shasums for later use.
        The next time that this function is run, it will only package
        the xlets whose folder contents has been changed.
        """
        print(Ansi.WARN("Creating xlets packages..."))

        cmd = "./tools/helper_shell_scripts/helper_shell_scripts.sh create-packages &"
        self.exec_command(cmd=cmd,
                          working_directory=self.root_path)

    def exec_command(self, cmd, working_directory, do_wait=True, do_log=True):
        """exec_command

        Run commands using Popen.

        Arguments:
            cmd {String} -- The command to run.
            working_directory {String} -- Working directory used by the command.

        Keyword Arguments:
            do_wait {Bool} -- Call or not the Popen wait() method. (default: {True})
            do_log {Bool} -- Log or not the command output. (default: {True})
        """
        try:
            # Passing a list instead of a string is the recommended.
            # I would do so if it would freaking work!!!
            # Always one step forward and two steps back with Python!!!
            po = Popen(cmd,
                       shell=True,
                       stdout=subprocess.PIPE,
                       stdin=subprocess.PIPE,
                       universal_newlines=True,
                       env=env,
                       cwd=working_directory)

            if do_wait:
                po.wait()

            if do_log:
                output, error_output = po.communicate()

                if po.returncode:
                    print(Ansi.ERROR(error_output))
                else:
                    print(Ansi.INFO(output))
        except OSError as err:
            print(Ansi.ERROR("Execution failed"), err, file=sys.stderr)


def get_parent_dir(fpath, go_up=0):
    """get_parent_dir

    Extract the path of the parent directory of a file path.

    Arguments:
        fpath {String} -- The full path to a file.

    Keyword Arguments:
        go_up {Number} -- How many directories to go up. (default: {0})

    Returns:
        [string] -- The new path to a directory.
    """
    dir_path = os.path.dirname(fpath)

    if go_up >= 1:
        for x in range(0, int(go_up)):
            dir_path = os.path.dirname(dir_path)

    return dir_path


def is_exec(fpath):
    return os.path.isfile(fpath) and os.access(fpath, os.X_OK)


def locate(pattern, root_path):
    """Locate all files matching supplied file name pattern in and below
    supplied root directory."""
    for path, dirs, files in os.walk(os.path.abspath(root_path)):
        for filename in fnmatch.filter(files, pattern):
            yield os.path.join(path, filename)
