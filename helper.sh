#!/bin/bash

prompt="Pick an option and press Enter:"
options+=("Render pug files" "Create packages" "Clone wiki")

ROOT_PATH="`dirname \"$0\"`"                 # relative
ROOT_PATH="`( cd \"$ROOT_PATH\" && pwd )`"   # absolutized and normalized

all_pug_files=("index.pug" "wiki.pug" "wiki_standalone.pug")

echoInfo() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 10)$1$(tput sgr0)" >&2
}

renderPugFiles() {
    # This requires to have the repository wiki cloned into a folder inside the docs folder.
    for pug_file in "${all_pug_files[@]}" ; do
        echo " "
        echoInfo "====== Rendering $pug_file ======"
        # Using a sub-shell to switch directories to avoid "back and forth".
        (
            cd "docs/src"
            pug $pug_file -o ../
        )
    done
}

createPackages() {
    # Cleanup folder
    rm -f $ROOT_PATH/docs/pkg/*

    (
        cd applets
        for applet in *; do
            if [ -d ${applet} ]; then
                echo " "
                echoInfo "====== Packaging $applet ======"
                (
                    cd "$applet/files"
                    tar -cvzf "$ROOT_PATH/docs/pkg/$applet.tar.gz" $applet
                )
            fi
        done
    )

    sleep 3

    (
        cd extensions
        for extension in *; do
            if [ -d ${extension} ]; then
                echo " "
                echoInfo "====== Packaging $extension ======"
                (
                    cd "$extension/files"
                    tar -cvzf "$ROOT_PATH/docs/pkg/$extension.tar.gz" $extension
                )
            fi
        done
    )

    sleep 3

    (
        cd themes
        for theme in *; do
            if [ -d ${theme} ]; then
                echo " "
                echoInfo "====== Packaging $theme ======"
                (
                    cd "$theme/files"
                    tar -cvzf "$ROOT_PATH/docs/pkg/$theme.tar.gz" $theme
                )
            fi
        done
    )
}

cloneWiki() {
    # Using a sub-shell to switch directories to avoid "back and forth".
    # Cloning into docs folder to keep main repo folder "uncluttered".
    (
        cd docs
        git clone https://github.com/Odyseus/CinnamonTools.wiki.git
    )
}

PS3="$prompt "
select opt in "${options[@]}" "Abort"; do
    case "$REPLY" in
        1 ) # Render pug files
            renderPugFiles
            ;;
        2 ) # Create packages
            createPackages
            break
            ;;
        3 ) # Clone wiki
            cloneWiki
            break
            ;;
        $(( ${#options[@]}+1 )) )
            echo "$(tput setaf 11)Operation cancelled.$(tput sgr0)"
            break
            ;;
        * )
            echo "$(tput setaf 11)Invalid option. Try another one.$(tput sgr0)"
            echo "$(tput bold)"
            continue
            ;;
    esac
done
