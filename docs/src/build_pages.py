#!/usr/bin/python3

import sys
import os

repo_folder = os.path.realpath(os.path.abspath(os.path.join(
    os.path.normpath(os.path.join(os.getcwd(), *([".."] * 2))))))

# The modules folder is two levels up from were this script is run (the repository folder).
# "tools/cinnamon_tools_python_modules"
tools_folder = os.path.join(repo_folder, "tools")

if tools_folder not in sys.path:
    sys.path.insert(0, tools_folder)

from cinnamon_tools_python_modules import mistune

md = mistune.Markdown()


class Main():

    def __init__(self):
        self.data = {}
        paths = {
            # Main HTML templates.
            "index_doc": os.path.join(repo_folder, "docs", "src", "index.html"),
            "wiki_doc": os.path.join(repo_folder, "docs", "src", "wiki.html"),
            "wiki_stabdalone_doc": os.path.join(repo_folder, "docs", "src", "wiki_standalone.html"),
            # includes folder.
            "index_css": os.path.join(repo_folder, "docs", "src", "includes", "_index_css.css"),
            "wiki_standalone_css": os.path.join(repo_folder, "docs", "src", "includes", "_wiki_standalone_css.css"),
            "noscript_html": os.path.join(repo_folder, "docs", "src", "includes", "_noscript.html"),
            "navbar_html": os.path.join(repo_folder, "docs", "src", "includes", "_navbar.html"),
            "navbar_for_standalone_html": os.path.join(
                repo_folder, "docs", "src", "includes", "_navbar_for_standalone.html"),
            "footer_html": os.path.join(repo_folder, "docs", "src", "includes", "_footer.html"),
            "linktotop_html": os.path.join(
                repo_folder, "docs", "src", "includes", "_linktotop.html"),
            "scriptsatbottom_html": os.path.join(
                repo_folder, "docs", "src", "includes", "_scriptsatbottom.html"),
            "wiki_index_html": os.path.join(
                repo_folder, "docs", "src", "includes", "_wiki_index.html"),
            "noscript_for_standalone_html": os.path.join(
                repo_folder, "docs", "src", "includes", "_noscript_for_standalone.html"),
            # lib/css
            "bootstrap_standalone_css": os.path.join(
                repo_folder, "docs", "lib", "css", "bootstrap-for-standalone.min.css"),
            "highlight_css": os.path.join(repo_folder, "docs", "lib", "css", "highlight.css"),
            "tweaks_css": os.path.join(repo_folder, "docs", "lib", "css", "tweaks.css"),
            "docs_css": os.path.join(repo_folder, "docs", "lib", "css", "docs.css"),
            # lib/js
            "jquery_js": os.path.join(repo_folder, "docs", "lib", "js", "jquery-3.2.1.min.js"),
            "bootstrap_js": os.path.join(repo_folder, "docs", "lib", "js", "bootstrap.min.js"),
            "highlight_js": os.path.join(repo_folder, "docs", "lib", "js", "highlight.pack.js"),
            "myfunctions_js": os.path.join(repo_folder, "docs", "lib", "js", "myFunctions.js"),
            # Misc. files.
            "readme_md": os.path.join(repo_folder, "README.md"),
            "github_tricks_md": os.path.join(
                repo_folder, "docs", "CinnamonTools.wiki", "GitHub-tips-&-tricks.md"),
            "xlet_development_md": os.path.join(
                repo_folder, "docs", "CinnamonTools.wiki", "Xlet-development.md"),
            "xlet_instalation_md": os.path.join(
                repo_folder, "docs", "CinnamonTools.wiki", "Xlet-instalation.md"),
            "xlet_localization_md": os.path.join(
                repo_folder, "docs", "CinnamonTools.wiki", "Xlet-localization.md"),
        }

        for p in paths:
            try:
                f = open(paths[p], "r")
                rd = f.read()
                f.close()
                self.data[p] = rd
            except Exception as detail:
                print(detail)
                self.data[p] = ""

    def create_html_document(self):
        index_doc = self.data["index_doc"].format(
            _index_css=self.data["index_css"],
            _noscript_html=self.data["noscript_html"],
            _navbar_html=self.data["navbar_html"],
            readme_md=md(self.data["readme_md"]),
            _footer_html=self.data["footer_html"],
            _linktotop_html=self.data["linktotop_html"],
            _scriptsatbottom_html=self.data["scriptsatbottom_html"],
        )

        wiki_doc = self.data["wiki_doc"].format(
            _noscript_html=self.data["noscript_html"],
            _navbar_html=self.data["navbar_html"],
            github_tricks_md=md(self.data["github_tricks_md"]),
            xlet_development_md=md(self.data["xlet_development_md"]),
            xlet_instalation_md=md(self.data["xlet_instalation_md"]),
            xlet_localization_md=md(self.data["xlet_localization_md"]),
            _wiki_index_html=self.data["wiki_index_html"],
            _footer_html=self.data["footer_html"],
            _linktotop_html=self.data["linktotop_html"],
            _scriptsatbottom_html=self.data["scriptsatbottom_html"],
        )

        wiki_stabdalone_doc = self.data["wiki_stabdalone_doc"].format(
            bootstrap_standalone_css=self.data["bootstrap_standalone_css"],
            highlight_css=self.data["highlight_css"],
            tweaks_css=self.data["tweaks_css"],
            docs_css=self.data["docs_css"],
            _wiki_standalone_css=self.data["wiki_standalone_css"],
            _noscript_for_standalone_html=self.data["noscript_for_standalone_html"],
            _navbar_for_standalone_html=self.data["navbar_for_standalone_html"],
            github_tricks_md=md(self.data["github_tricks_md"]),
            xlet_development_md=md(self.data["xlet_development_md"]),
            xlet_instalation_md=md(self.data["xlet_instalation_md"]),
            xlet_localization_md=md(self.data["xlet_localization_md"]),
            _wiki_index_html=self.data["wiki_index_html"],
            _footer_html=self.data["footer_html"],
            _linktotop_html=self.data["linktotop_html"],
            jquery_js=self.data["jquery_js"],
            bootstrap_js=self.data["bootstrap_js"],
            highlight_js=self.data["highlight_js"],
            myfunctions_js=self.data["myfunctions_js"],
        )

        self.save_file(os.path.join(repo_folder, "docs", "index.html"), index_doc)
        self.save_file(os.path.join(repo_folder, "docs", "wiki.html"), wiki_doc)
        self.save_file(os.path.join(repo_folder, "docs",
                                    "wiki_standalone.html"), wiki_stabdalone_doc)

    def save_file(self, path, data):
        try:
            with open(path, "w") as html_file:
                html_file.write(data)

            html_file.close()
        except Exception as detail:
            print("Failed to write to %s" % path)
            print(detail)


if __name__ == "__main__":
    m = Main()
    m.create_html_document()
