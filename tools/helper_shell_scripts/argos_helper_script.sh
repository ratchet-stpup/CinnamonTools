#!/bin/bash

# This script, when loaded into an instance of Argos for Cinnamon applet, will
# create a menu from which all options/arguments of the helper.py script can be
# executed.

ROOT_PATH="`( cd ../.. && pwd )`" # This should be the root of the repository.

echo "---"
echo "GUI | bash=\"(cd $ROOT_PATH && ./helper.py --gui)\" terminal=true"
echo "---"
echo "Update POT files | bash=\"(cd $ROOT_PATH && ./helper.py --update-pot-files)\" terminal=true"
echo "Create localized help | bash=\"(cd $ROOT_PATH && ./helper.py --create-localized-help)\" terminal=true"
echo "Generate trans stats | bash=\"(cd $ROOT_PATH && ./helper.py --generate-trans-stats)\" terminal=true"
echo "Create changelogs | bash=\"(cd $ROOT_PATH && ./helper.py --create-changelogs)\" terminal=true"
echo "Create packages | bash=\"(cd $ROOT_PATH && ./helper.py --create-packages)\" terminal=true"
echo "---"
echo "<b>Bulk actions</b>"
echo "Create changelogs and packages | bash=\"(cd $ROOT_PATH && ./helper.py --create-changelogs --create-packages)\" terminal=true"
echo "---"
echo "Various"
echo "--Generate meta file | bash=\"(cd $ROOT_PATH && ./helper.py --generate-meta-file)\" terminal=true"
echo "--Compare xlets | bash=\"(cd $ROOT_PATH && ./helper.py --compare-xlets)\" terminal=true"
echo "--Compare applets | bash=\"(cd $ROOT_PATH && ./helper.py --compare-applets)\" terminal=true"
echo "--Compare extensions | bash=\"(cd $ROOT_PATH && ./helper.py --compare-extensions)\" terminal=true"
echo "--Check executable | bash=\"(cd $ROOT_PATH && ./helper.py --check-executable)\" terminal=true"
echo "--Set executable | bash=\"(cd $ROOT_PATH && ./helper.py --check-executable --set-executable)\" terminal=true"
echo "--Clone wiki | bash=\"(cd $ROOT_PATH && ./helper.py --clone-wiki)\" terminal=true"
echo "--Render main site | bash=\"(cd $ROOT_PATH && ./helper.py --render-main-site)\" terminal=true"
