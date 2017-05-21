#!/usr/bin/python3

import os
import json
from. import ansi_colors

Ansi = ansi_colors.ANSIColors()


class XletsMeta(object):
    def __init__(self, root_path=os.getcwd()):
        with open(os.path.join(root_path, "tmp", "xlets_metadata.json"), "r") as xlets_metadata:
            self.list = list(json.loads(xlets_metadata.read()))


def generate_meta_file(root_path=os.getcwd()):
    print(Ansi.YELLOW_BOLD("Generating xlets metadata file..."))
    xlet_meta_files = []
    xlet_meta = []

    for dirname, dirnames, filenames in os.walk(os.path.join(root_path, "applets"), topdown=False):
        for filename in filenames:
            if filename == "metadata.json":
                xlet_meta_files.append(os.path.join(dirname, filename))

    for dirname, dirnames, filenames in os.walk(os.path.join(root_path, "extensions"), topdown=False):
        for filename in filenames:
            if filename == "metadata.json":
                xlet_meta_files.append(os.path.join(dirname, filename))

    for i in range(0, len(xlet_meta_files)):
        with open(xlet_meta_files[i], "r") as xlet_meta_file:
            raw_meta = xlet_meta_file.read()
            json_meta = json.loads(raw_meta)
            # Store the path to the metadata.json file so I can use it to create
            # the different needed paths when needed.
            # This will allow me to avoid to constantly create a path with
            # os.path.join in my functions. I will just use the metadata.json path
            # and "traverse it".
            json_meta["meta-path"] = xlet_meta_files[i]

            if "applets" in xlet_meta_files[i]:
                json_meta["type"] = "applet"
            elif "extensions" in xlet_meta_files[i]:
                json_meta["type"] = "extension"

            xlet_meta.append(json_meta)

        xlet_meta_file.close()

    with open(os.path.join(root_path, "tmp", "xlets_metadata.json"), "w") as outfile:
        json.dump(xlet_meta, outfile, indent=4, ensure_ascii=False)
