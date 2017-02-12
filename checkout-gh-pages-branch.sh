#!/bin/bash

# This script is used to ckeckout the gh-pages branch of this repository.
# The branch is checked out inside a folder called gh-pages and it is ignored
# inside the master branch .gitignore file.
# This is done to avoid constant checkouts between master and gh-pages branches.

[ ! -d gh-pages ] && mkdir -p gh-pages

wait

git clone https://github.com/Odyseus/CinnamonTools.git gh-pages && cd gh-pages && git checkout gh-pages
