#!/bin/bash

prompt="Pick an option and press Enter:"
options+=("Render main site" "Render help files" "Create packages" "Clone wiki")

ROOT_PATH="`dirname \"$0\"`"                 # relative
ROOT_PATH="`( cd \"$ROOT_PATH\" && pwd )`"   # absolutized and normalized

all_pug_files=("index.pug" "wiki.pug" "wiki_standalone.pug")

echoInfo() {
    [ $# -gt 0 ] && echo -e "$(tput bold)$(tput setaf 10)$1$(tput sgr0)" >&2
}

renderMainSite() {
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

renderHelpFiles() {
    (
        cd applets
        for applet in *; do
            if [ -d ${applet} ]; then
                (
                    cd "$applet"
                    if [ -f HELP.pug ]; then
                        echo " "
                        echoInfo "====== Rendering help file for $applet ======"
                        pug HELP.pug -o "files/$applet"
                    fi
                )
            fi
        done
    )

    (
        cd extensions
        for extension in *; do
            if [ -d ${extension} ]; then
                (
                    cd "$extension"
                    if [ -f HELP.pug ]; then
                        echo " "
                        echoInfo "====== Rendering help file for $extension ======"
                        pug HELP.pug -o "files/$extension"
                    fi
                )
            fi
        done
    )
}

get_sha512sum() {
    # https://unix.stackexchange.com/a/158766
    # This was the only method that I found that gives me really different shasums.
    # With other methods, if I only change the name of a single file, would give
    # the exact same shasum.
    dir="$(tr '\\' / <<< "$1" | tr -s / | sed 's-/$--')"
    cutted=$((${#dir} + 35))
    sha=$(find "$dir" -type f -exec sha512sum {} \; | cut -c 1-33,$cutted- | sort | sha512sum | cut -c 1-32)
    eval "$2='$sha'"
}

createPackages() {
    # Create the tmp dir if it doesn't exists.
    # For now, the tmp dir is only used to store the shasums.
    # The shasums are used to avoid the re-packaging of xlets that weren't modified.
    if [ ! -d $ROOT_PATH/tmp/shasums ]; then
      mkdir -p $ROOT_PATH/tmp/shasums;
    fi

    # Using a sub-shell to switch directories to avoid "back and forth".
    # It seems more work, but it really isn't because the following three
    # sub-shells are practically the same.
    (
        cd applets
        for applet in *; do
            if [ -d ${applet} ]; then
                # Get the previously calculated shasum if any.
                # Store it earlier just in case.
                if [ ! -f $ROOT_PATH/tmp/shasums/$applet ]; then
                    current_applet_sha=""
                else
                    current_applet_sha=$(<$ROOT_PATH/tmp/shasums/$applet)
                fi

                (
                    cd "$applet/files"
                    new_sha=""
                    get_sha512sum "$ROOT_PATH/applets/$applet/files/$applet" new_sha

                    echo " "
                    sleep 0.2

                    if [ "$new_sha" == "$current_applet_sha" ]; then
                        # If the stored and the calculated shasums are equal:
                        # Do nothing and do not touch the stored shasum.
                        echoInfo "====== Skipping packaging of $applet ======"
                    else
                        # If the stored and the calculated shasums are NOT equal:
                        # 1- Store the new calculated shasum.
                        # 2- Delete old package.
                        # 3- Create new package.
                        echoInfo "====== Storing shasum for $applet ======"
                        # Store the shasum WITHOUT the freaking new line (-n argument).
                        echo -n $new_sha > $ROOT_PATH/tmp/shasums/$applet

                        echoInfo "====== Deleting old $applet package ======"
                        rm -f $ROOT_PATH/docs/pkg/$applet.tar.gz

                        echoInfo "====== Packaging $applet ======"
                        tar -cvzf "$ROOT_PATH/docs/pkg/$applet.tar.gz" $applet
                    fi
                )
            fi
        done
    )

    sleep 1

    (
        cd extensions
        for extension in *; do
            if [ -d ${extension} ]; then
                if [ ! -f $ROOT_PATH/tmp/shasums/$extension ]; then
                    current_extension_sha=""
                else
                    current_extension_sha=$(<$ROOT_PATH/tmp/shasums/$extension)
                fi

                (
                    cd "$extension/files"
                    new_sha=""
                    get_sha512sum "$ROOT_PATH/extensions/$extension/files/$extension" new_sha

                    echo " "
                    sleep 0.2

                    if [ "$new_sha" == "$current_extension_sha" ]; then
                        echoInfo "====== Skipping packaging of $extension ======"
                    else
                        echoInfo "====== Storing shasum for $extension ======"
                        echo -n $new_sha > $ROOT_PATH/tmp/shasums/$extension

                        echoInfo "====== Deleting old $extension package ======"
                        rm -f $ROOT_PATH/docs/pkg/$extension.tar.gz

                        echoInfo "====== Packaging $extension ======"
                        tar -cvzf "$ROOT_PATH/docs/pkg/$extension.tar.gz" $extension
                    fi
                )
            fi
        done
    )

    sleep 1

    (
        cd themes
        for theme in *; do
            if [ -d ${theme} ]; then
                if [ ! -f $ROOT_PATH/tmp/shasums/$theme ]; then
                    current_sha=""
                else
                    current_sha=$(<$ROOT_PATH/tmp/shasums/$theme)
                fi

                (
                    cd "$theme/files"
                    new_sha=""
                    get_sha512sum "$ROOT_PATH/themes/$theme/files/$theme" new_sha

                    echo " "
                    sleep 0.2

                    if [ "$new_sha" == "$current_sha" ]; then
                        echoInfo "====== Skipping packaging of $theme ======"
                    else
                        echoInfo "====== Storing shasum for $theme ======"
                        echo -n $new_sha > $ROOT_PATH/tmp/shasums/$theme

                        echoInfo "====== Deleting old $theme package ======"
                        rm -f $ROOT_PATH/docs/pkg/$theme.tar.gz

                        echoInfo "====== Packaging $theme ======"
                        tar -cvzf "$ROOT_PATH/docs/pkg/$theme.tar.gz" $theme
                    fi
                )
            fi
        done
    )

    sleep 1

    (
        cd tools
        for tool in *; do
            if [ -d ${tool} ]; then
                if [ ! -f $ROOT_PATH/tmp/shasums/$tool ]; then
                    current_sha=""
                else
                    current_sha=$(<$ROOT_PATH/tmp/shasums/$tool)
                fi

                new_sha=""
                get_sha512sum "$ROOT_PATH/tools/$tool" new_sha

                echo " "
                sleep 0.2

                if [ "$new_sha" == "$current_sha" ]; then
                    echoInfo "====== Skipping packaging of $tool ======"
                else
                    echoInfo "====== Storing shasum for $tool ======"
                    echo -n $new_sha > $ROOT_PATH/tmp/shasums/$tool

                    echoInfo "====== Deleting old $tool package ======"
                    rm -f $ROOT_PATH/docs/pkg/$tool.tar.gz

                    echoInfo "====== Packaging $tool ======"
                    tar -cvzf "$ROOT_PATH/docs/pkg/$tool.tar.gz" $tool
                fi
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
        1 ) # Render main site pug files
            renderMainSite
            ;;
        2 ) # Render help pug files
            renderHelpFiles
            ;;
        3 ) # Create packages
            createPackages
            break
            ;;
        4 ) # Clone wiki
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
            ;;
    esac
done
