#!/usr/bin/python3

import sys
import os

repo_folder = os.path.realpath(os.path.abspath(os.path.join(os.path.normpath(os.getcwd()))))

# from gi.repository import GLib
from argparse import ArgumentParser
from tools.cinnamon_tools_python_modules.helper_functions import XletsHelperCore


USAGE = """"""


class Main:

    def __init__(self):
        parser = ArgumentParser(usage=USAGE)
        parser.add_argument("-g", "--generate-meta-file", action="store_true",
                            dest="generate_meta_file", default=False)
        parser.add_argument("-r", "--render-main-site", action="store_true",
                            dest="render_main_site", default=False)
        parser.add_argument("-l", "--create-localized-help", action="store_true",
                            dest="create_localized_help", default=False)
        parser.add_argument("-t", "--generate-trans-stats", action="store_true",
                            dest="generate_trans_stats", default=False)
        parser.add_argument("-u", "--update-pot-files", action="store_true",
                            dest="update_pot_files", default=False)
        parser.add_argument("-c", "--create-changelogs", action="store_true",
                            dest="create_changelogs", default=False)
        parser.add_argument("-x", "--check-executable", action="store_true",
                            dest="check_executables", default=False)
        parser.add_argument("-s", "--set-executable", action="store_true",
                            dest="set_executables", default=False)
        parser.add_argument("-y", "--compare-xlets", action="store_true",
                            dest="compare_xlets", default=False)
        parser.add_argument("-a", "--compare-applets", action="store_true",
                            dest="compare_applets", default=False)
        parser.add_argument("-e", "--compare-extensions", action="store_true",
                            dest="compare_extensions", default=False)
        parser.add_argument("-w", "--clone-wiki", action="store_true",
                            dest="clone_wiki", default=False)
        parser.add_argument("-p", "--create-packages", action="store_true",
                            dest="create_packages", default=False)
        parser.add_argument("-i", "--gui", action="store_true",
                            dest="gui", default=False)
        # parser.add_argument("-s", "--skip-keys", dest="skip_keys")

        options = parser.parse_args()

        if len(sys.argv) == 1:
            parser.print_help()
            quit()

        xlets_helper = XletsHelperCore(root_path=repo_folder)

        # The "Order" is only there as a guide in case that more than one argument is passed.

        # Tested OK
        # Order = 0
        # Mainly not needed since the xlets_metadata.json file will be automatically
        # created if it doesn't exists.
        if options.generate_meta_file:
            xlets_helper.generate_meta_file()

        # Tested OK
        # Order = 1
        # Needs meta file.
        if options.update_pot_files:
            xlets_helper.update_pot_files()

        # Tested OK
        # Order = 2.
        # Needs meta file.
        if options.create_changelogs:
            xlets_helper.create_changelogs()

        # Tested OK
        # Order = 3
        # Needs meta file.
        # Needs updated pot files after update_pot_files execution.
        if options.create_localized_help:
            xlets_helper.create_localized_help()

        # Tested OK
        # Order = 4
        # Needs meta file.
        if options.generate_trans_stats:
            xlets_helper.generate_trans_stats()

        # Tested OK
        # Order = Doesn't matter.
        if options.check_executables:
            if options.set_executables:
                xlets_helper.set_executables()
            else:
                xlets_helper.check_executables()

        # Tested OK
        # Order = Doesn't matter.
        if options.render_main_site:
            xlets_helper.render_main_site(working_directory=repo_folder)

        # Tested OK
        # Order = Doesn't matter.
        if options.compare_xlets:
            xlets_helper.compare_xlets()

        # Tested OK
        # Order = Doesn't matter.
        if options.compare_applets:
            xlets_helper.compare_xlets(compare_extensions=False)

        # Tested OK
        # Order = Doesn't matter.
        if options.compare_extensions:
            xlets_helper.compare_xlets(compare_applets=False)

        # Tested OK
        # Order = Doesn't matter.
        if options.clone_wiki:
            xlets_helper.clone_wiki()

        # Tested OK
        # Order = Doesn't matter.
        if options.create_packages:
            xlets_helper.create_packages()

        # Tested OK
        # Order = Doesn't matter.
        if options.gui:
            from tools.cinnamon_tools_python_modules.helper_app import XletsHelperApp

            app = XletsHelperApp(root_path=repo_folder)
            app.run()


if __name__ == "__main__":
    Main()
