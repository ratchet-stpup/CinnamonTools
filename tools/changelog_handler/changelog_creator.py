#!/usr/bin/python3

"""
This is just for tests.
Not used for now.
"""

import os
import subprocess

repo_folder = os.path.realpath(os.path.abspath(os.path.join(
    os.path.normpath(os.path.join(os.getcwd(), *([".."] * 2))))))

ENTRY_TEMPLATE = """
**Commit Hash:** {hash}<br>
**Author:** {author_name}<br>
**Date:** {date}<br>

{body}
"""

GIT_COMMIT_BASE_URL = "https://github.com/Odyseus/CinnamonTools/commit/"
GIT_COMMIT_FIELDS = ["hash", "author_name", "date", "title", "message"]
# GIT_LOG_FORMAT = ["%H", "%an", "%ad", "%s", "%b"]
GIT_LOG_FORMAT = "%x1f".join(["%h", "%an", "%ad", "%s", "%b"]) + "%x1e"
GIT_DATE_FORMAT = ["%Y-", "%m-", "%d ", "%H:", "%M:", "%S"]
GIT_DATE_FORMAT = "".join(GIT_DATE_FORMAT)

# -- \"applets/0dyseus@CustomCinnamonMenu\"

# --date=format:"%Y-%m-%d %H:%M:%S" --format="%h %an %ad %s %b

p = subprocess.Popen("git log \"./applets/0dyseus@CustomCinnamonMenu\" --date=format:\"%s\" --format=\"%s\"" % (
    GIT_DATE_FORMAT, GIT_LOG_FORMAT), shell=True, stdout=subprocess.PIPE, cwd=repo_folder)
(full_log, x) = p.communicate()

full_log = full_log.decode()
full_log = full_log.strip("\n\x1e")
full_log = full_log.split("\x1e")
full_log = [row.strip().split("\x1f") for row in full_log]
full_log = [dict(zip(GIT_COMMIT_FIELDS, row)) for row in full_log]
# Sort commits by date.
full_log = sorted(full_log, key=lambda commit: commit["date"], reverse=True)

ENTRIES = []

for e in full_log:
    hash_link = "[%s](%s)" % (e["hash"], GIT_COMMIT_BASE_URL + e["hash"])
    body = None

    if "message" in e:
        body = "\n\n".join(e["message"].split("\n"))

    if body:
        entry = ENTRY_TEMPLATE.format(hash=hash_link,
                                      author_name=e["author_name"],
                                      date=e["date"],
                                      body=body)
        ENTRIES.append(entry)

print("".join(ENTRIES))
# print(full_log)
# print(len(full_log))
# print(GIT_LOG_FORMAT)
# print(GIT_DATE_FORMAT)
